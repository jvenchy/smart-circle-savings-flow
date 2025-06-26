import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is required but not found in environment variables');
}

// Use service role key if available (bypasses RLS), otherwise use anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

if (!supabaseKey) {
  throw new Error('Either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required but not found in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 