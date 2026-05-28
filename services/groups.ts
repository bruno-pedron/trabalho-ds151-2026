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