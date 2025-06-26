import { supabase } from './supabaseClient';

export async function fetchNotifications(userId: string) {
  const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data;
}

export async function addNotification(userId: string, message: string, type: string = 'info') {
  await supabase.from('notifications').insert({ user_id: userId, message, type, created_at: new Date().toISOString() });
} 