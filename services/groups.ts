import { supabase } from '@/supabase/supabase'


export async function createGroup(
  name: string,
  userId: string
) {

  const { data: group, error } = await supabase
    .from('groups')
    .insert({
      name,
      created_by: userId
    })
    .select()
    .single()

  if (error) {
    console.log("failed at creating the group itself:\nname:",name,"\ncreated_by:",userId);
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

export async function getUserGroups(
  userId: string
) {

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

  if (error) {
    throw error
  }

  return data
}

export async function updateGroup(
  groupId: string,
  newName: string
) {

  const { data, error } = await supabase
    .from('groups')
    .update({
      name: newName
    })
    .eq('id', groupId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteGroup(
  groupId: string
) {

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId);

  if (error) {
    throw error;
  }
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

  if (error) {
    throw error;
  }

  return data;
}