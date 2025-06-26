import { supabase } from './supabaseClient';

// Get all rewards for a user
export async function fetchRewards(userId: string) {
  const { data } = await supabase.from('rewards').select('*').eq('user_id', userId);
  return data;
}

// Get all challenge participations for a user
export async function fetchChallengeParticipations(userId: string) {
  const { data } = await supabase.from('challenge_participants').select('*').eq('user_id', userId);
  return data;
}

export async function fetchSavingsStats(userId: string) {
  const { data } = await supabase.from('savings').select('*').eq('user_id', userId);
  return data;
}

export async function fetchAchievements(userId: string) {
  const { data } = await supabase.from('achievements').select('*').eq('user_id', userId);
  return data;
}

export async function addSavings(userId: string, amount: number, category: string) {
  await supabase.from('savings').insert({ user_id: userId, amount, category, date: new Date().toISOString() });
} 