import { supabase } from './supabaseClient';

export async function fetchChallenges() {
  const { data } = await supabase.from('challenges').select('*');
  return data;
}

export async function joinChallenge(challengeId: string, userId: string, circleId: string) {
  await supabase.from('challenge_participants').insert({ challenge_id: challengeId, user_id: userId, circle_id: circleId });
}

export async function updateChallengeProgress(challengeId: string, progress: number) {
  await supabase.from('challenges').update({ progress }).eq('id', challengeId);
}

export async function distributeChallengeRewards(challengeId: string) {
  // This would contain logic to split and distribute rewards to members
  // For now, just update the challenge as completed
  await supabase.from('challenges').update({ status: 'completed' }).eq('id', challengeId);
} 