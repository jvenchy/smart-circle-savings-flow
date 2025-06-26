import { supabase } from './supabaseClient';

// Fetch all group deals
export async function fetchDeals() {
  const { data } = await supabase.from('group_deals').select('*').eq('active', true);
  return data;
}

// Join a group deal
export async function joinDeal(dealId: string, userId: string, circleId: string) {
  await supabase.from('deal_participants').insert({ deal_id: dealId, user_id: userId, circle_id: circleId });
}

export async function lockDeal(dealId: string) {
  // Update deal status to locked
  await supabase.from('deals').update({ status: 'locked' }).eq('id', dealId);
} 