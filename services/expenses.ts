import { Tables } from '@/database.types';
import { supabase } from '@/supabase/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

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

export async function getUserExpenses(userId: string): Promise<Tables<'expenses'>[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('paid_by', userId)
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

export async function uploadReceiptImage(imageUri: string): Promise<string> {
  try {
    //nome unico pro arquivo
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const filePath = `user_receipts/${fileName}`;

    // Lê o arquivo local como base64 usando a API legacy do Expo FileSystem
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Faz o upload do ArrayBuffer (decodificado do base64) para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(filePath, decode(base64), {
        contentType: 'image/jpeg',
      });

    if (error) {
      throw error;
    }

    return filePath;
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    throw error;
  }
}

export async function getReceiptSignedUrl(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('receipts')
      .createSignedUrl(filePath, 60 * 60); // 1 hora de validade

    if (error) {
      console.error("Erro ao gerar URL assinada:", error);
      return null;
    }

    return data?.signedUrl || null;
  } catch (error) {
    console.error("Erro inesperado ao gerar URL assinada:", error);
    return null;
  }
}
