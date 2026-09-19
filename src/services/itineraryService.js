import { isSupabaseConfigured, supabase } from "./supabase";
import { localDb } from "./localDb";

export async function getItineraryItems(userId, tripId) {
  if (!isSupabaseConfigured) return localDb.listItinerary(userId, tripId);

  const { data, error } = await supabase
    .from("itinerary_items")
    .select("*")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .order("date", { ascending: true })
    .order("time", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createItineraryItem(userId, payload) {
  if (!isSupabaseConfigured) return localDb.createItineraryItem(userId, payload);

  const { data, error } = await supabase
    .from("itinerary_items")
    .insert([{ ...payload, user_id: userId }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateItineraryItem(userId, id, payload) {
  if (!isSupabaseConfigured) return localDb.updateItineraryItem(userId, id, payload);

  const { data, error } = await supabase
    .from("itinerary_items")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteItineraryItem(userId, id) {
  if (!isSupabaseConfigured) return localDb.deleteItineraryItem(userId, id);

  const { error } = await supabase.from("itinerary_items").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export function groupByDay(items) {
  const groups = {};
  items.forEach((item) => {
    if (!groups[item.date]) groups[item.date] = [];
    groups[item.date].push(item);
  });
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}
