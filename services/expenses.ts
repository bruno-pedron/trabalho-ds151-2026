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