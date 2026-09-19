import { isSupabaseConfigured, supabase } from "./supabase";
import { localDb } from "./localDb";

export async function getExpenses(userId, tripId) {
  if (!isSupabaseConfigured) return localDb.listExpenses(userId, tripId);

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createExpense(userId, payload) {
  if (!isSupabaseConfigured) return localDb.createExpense(userId, payload);

  const { data, error } = await supabase
    .from("expenses")
    .insert([{ ...payload, user_id: userId }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateExpense(userId, id, payload) {
  if (!isSupabaseConfigured) return localDb.updateExpense(userId, id, payload);

  const { data, error } = await supabase
    .from("expenses")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExpense(userId, id) {
  if (!isSupabaseConfigured) return localDb.deleteExpense(userId, id);

  const { error } = await supabase.from("expenses").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export function summarizeExpenses(expenses, budget = 0) {
  const spent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const remaining = Number(budget) - spent;
  const byCategory = {};
  expenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount || 0);
  });
  return { spent, remaining, byCategory };
}
