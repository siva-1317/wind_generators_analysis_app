import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export let supabase: SupabaseClient | null = null;

const isPlaceholder =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('your-supabase-project') ||
  supabaseUrl.includes('your-project') ||
  supabaseAnonKey.includes('your_supabase');

if (!isPlaceholder) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    console.log('[Supabase Client] Connected to cloud project successfully.');
  } catch (e) {
    console.warn('[Supabase Client] Init error, fallback to demo mode:', e);
  }
} else {
  console.log('[Supabase Client] Credentials missing or placeholder. Running in Standalone Demo Mode.');
}
