import { MOCK_PLACES, findDestinationGuide } from "../data/demoData";
import { isSupabaseConfigured, supabase } from "./supabase";
import { localDb } from "./localDb";

function matchesDestination(place, destination) {
  if (!destination?.trim()) return true;
  const dest = destination.toLowerCase().trim();
  const placeDest = (place.destination || "").toLowerCase();
  const placeLoc = (place.location || "").toLowerCase();
  return (
    placeDest === dest ||
    placeDest.includes(dest) ||
    dest.includes(placeDest) ||
    placeLoc.includes(dest)
  );
}

/**
 * Discovery uses mock data for now.
 * Swap this function body later for Google Places / Foursquare.
 */
export async function discoverPlaces({ destination, category, query, highlightsOnly } = {}) {
  await new Promise((r) => setTimeout(r, 200));
  let results = [...MOCK_PLACES];

  if (destination) {
    results = results.filter((p) => matchesDestination(p, destination));
  }
  if (highlightsOnly) {
    results = results.filter((p) => p.highlight);
  }
  if (category && category !== "All") {
    results = results.filter((p) => p.category === category);
  }
  if (query?.trim()) {
    const q = query.trim().toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.blurb || "").toLowerCase().includes(q)
    );
  }
  return results;
}

export function getFamousPlaceNames(destination, country) {
  const guide = findDestinationGuide(destination, country);
  return guide?.famousPlaces || [];
}

export async function getSavedPlaces(userId, tripId) {
  if (!isSupabaseConfigured) return localDb.listSavedPlaces(userId, tripId);

  const { data, error } = await supabase
    .from("saved_places")
    .select("*")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function savePlace(userId, payload) {
  if (!isSupabaseConfigured) return localDb.savePlace(userId, payload);

  const { data, error } = await supabase
    .from("saved_places")
    .insert([{ ...payload, user_id: userId }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeSavedPlace(userId, id) {
  if (!isSupabaseConfigured) return localDb.deleteSavedPlace(userId, id);

  const { error } = await supabase.from("saved_places").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}
