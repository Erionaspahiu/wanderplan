import { isSupabaseConfigured, supabase } from "./supabase";
import { localDb } from "./localDb";

export async function getTrips(userId) {
  if (!isSupabaseConfigured) return localDb.getTrips(userId);

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getTrip(userId, tripId) {
  if (!isSupabaseConfigured) return localDb.getTrip(userId, tripId);

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function createTrip(userId, payload) {
  if (!isSupabaseConfigured) return localDb.createTrip(userId, payload);

  const { data, error } = await supabase
    .from("trips")
    .insert([{ ...payload, user_id: userId }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTrip(userId, tripId, payload) {
  if (!isSupabaseConfigured) return localDb.updateTrip(userId, tripId, payload);

  const { data, error } = await supabase
    .from("trips")
    .update(payload)
    .eq("id", tripId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTrip(userId, tripId) {
  if (!isSupabaseConfigured) return localDb.deleteTrip(userId, tripId);

  const { error } = await supabase.from("trips").delete().eq("id", tripId).eq("user_id", userId);
  if (error) throw error;
}
