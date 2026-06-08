import { supabase } from '@/supabase/supabase'


export async function createGroup(name: string, userId: string) {

  const { data: group, error } = await supabase
    .from('groups')
    .insert({
      name,
      created_by: userId
    })
    .select()
    .single()

  if (error) {
    console.log("failed at creating the group itself:\nname:", name, "\ncreated_by:", userId);
    throw error
  }

  const { error: memberError } = await supabase
    .from('group_members')
    .upsert({
      group_id: group.id,
      user_id: userId,
      role: 'owner',
    })

  if (memberError) {
    console.log("failed at adding owner to the group");
    throw memberError
  }
  return group
}

export async function getUserGroups(userId: string) {

  const { data, error } = await supabase
    .from('group_members')
    .select(`
      role,
      groups (
        id,
        name,
        created_by,
        created_at
      )
    `)
    .eq('user_id', userId)

  if (error) throw error
  return data
}

export async function updateGroup(groupId: string, newName: string) {

  const { data, error } = await supabase
    .from('groups')
    .update({
      name: newName
    })
    .eq('id', groupId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteGroup(groupId: string) {

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId);

  if (error) throw error;

}

export async function getGroupMembers(groupId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      role,
      joined_at,
      users (
        id,
        name
      )
    `)
    .eq('group_id', groupId);

  if (error) throw error;
  return data;
}

export async function getGroupDetails(groupId: string) {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      name,
      invite_code
    `)
    .eq('id', groupId)
    .single()

  if (error) throw error;
  return data
}

export async function joinGroup(inviteCode: string, userId: string) {
  //busca o grupo pelo código de convite
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id')
    .eq('invite_code', inviteCode)
    .single();

  if (groupError) {
    throw new Error('Código de convite inválido ou grupo não encontrado.');
  }

  //adiciona o usuário ao grupo
  const { data, error } = await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: userId,
      role: 'member'
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Você já está neste grupo.');
    }
    throw error;
  }
  return data
}

export async function removeFromGroup(groupId: string, userId: string) {

  const { data, error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)

  if (error) {
    throw error;
    throw new Error('Falha ao remover usuário do grupo')
  }
}
