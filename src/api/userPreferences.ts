import { supabase } from './supabaseClient';

// Fetch user preferences
export async function fetchUserPreferences(userId: string) {
  const { data } = await supabase.from('user_preferences').select('*').eq('user_id', userId);
  return data;
}

// Update a user preference
export async function updateUserPreference(userId: string, key: string, value: string) {
  await supabase.from('user_preferences').upsert({ user_id: userId, preference_key: key, preference_value: value });
} 