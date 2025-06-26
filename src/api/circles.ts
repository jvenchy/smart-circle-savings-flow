import { supabase } from './supabaseClient';
import { matchUserToCircle } from './openai';

export async function assignCircle(userProfile: any) {
  const circle = await matchUserToCircle(userProfile);
  // Save circle assignment in Supabase
  await supabase.from('circles').upsert({ user_id: userProfile.id, circle });
  return circle;
}

// Get the user's active circle
export async function getUserCircle(userId: string) {
  const { data, error } = await supabase
    .from('circle_memberships')
    .select('circle_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();
  return data?.circle_id;
}

// Get all members of a circle
export async function getCircleMembers(circleId: string) {
  const { data } = await supabase
    .from('circle_memberships')
    .select('user_id')
    .eq('circle_id', circleId)
    .eq('is_active', true);
  return data?.map((row: any) => row.user_id) || [];
} 