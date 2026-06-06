import { Tables } from '@/database.types';
import { supabase } from '@/supabase/supabase'


export async function createUser(name: string): Promise<Tables<"users">> {

  const created_at = Date.now();

  const { data, error } = await supabase
    .from('users')
    .insert({
      name: name,
      created_at: created_at
    })
    .select()
    .single()

  if (error) {
    console.log("failed at creating the user itself:\nname:", name, "\ncreated_at:", created_at);
    throw error
  }
  return data
}

export async function getUser(userId: string): Promise<Tables<"users">> {

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    throw error
  }
  return data
}

export async function updateUser(userId: string, newName: string): Promise<Tables<"users">> {

  const { data, error } = await supabase
    .from('users')
    .update({
      name: newName
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }
  return data
}

export async function deleteUser(userId: string) {

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

