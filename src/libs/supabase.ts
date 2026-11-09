import dotenv from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const supabaseUrl = isProduction
  ? process.env.PUBLIC_SUPABASE_URL
  : process.env.PUBLIC_SUPABASE_URL_DEV;

const serviceRoleKey = isProduction
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : process.env.SUPABASE_SERVICE_ROLE_KEY_DEV;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    `❌ Missing Supabase configuration for ${isProduction ? 'production' : 'development'} mode. ` +
    'Set PUBLIC_SUPABASE_URL(_DEV) and SUPABASE_SERVICE_ROLE_KEY(_DEV) in .env.',
  );
}

// The service role key bypasses row-level security so the bot can act on behalf
// of any linked account. Keep it server-side only.
const supabase: SupabaseClient = createClient(supabaseUrl ?? '', serviceRoleKey ?? '', {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

console.log(`Connected to Supabase ${isProduction ? 'production' : 'development'} mode 🛻`);

export default supabase;
