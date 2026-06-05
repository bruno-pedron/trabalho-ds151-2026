import { supabase } from '@/supabase/supabase';

export async function createExpense(
  groupId: string,
  paidBy: string,
  description: string,
  amount: number,
  receiptUrl?: string,
) {

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      group_id: groupId,
      paid_by: paidBy,
      description,
      amount,
      receipt_url: receiptUrl || null,
    })
    .select()
    .single();

  if (error) {
    console.log("failed at creating the expense");
    throw error
  } 

  return data;
}

export async function getGroupExpenses(
  groupId: string
) {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      id,
      description,
      amount,
      receipt_url,
      created_at,
      paid_by,
      users (
        id,
        name
      )
    `)
    .eq('group_id', groupId)
    .order('created_at', {
      ascending: false
    });

  if (error) {
    throw error;
  }

  return data;
}

export async function getExpenseById(
  expenseId: string
) {

  const { data, error } = await supabase
    .from('expenses')
    .select(`
      id,
      description,
      amount,
      receipt_url,
      created_at,
      paid_by,
      users (
        id,
        name
      )
    `)
    .eq('id', expenseId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateExpense(
  expenseId: string,
  description: string,
  amount: number
) {

  const { data, error } = await supabase
    .from('expenses')
    .update({
      description,
      amount
    })
    .eq('id', expenseId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteExpense(
  expenseId: string
) {

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) {
    throw error;
  }
}