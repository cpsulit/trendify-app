import { createClient } from '@supabase/supabase-js';

// ✅ Load environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🔍 Debug check (add this temporarily)
console.log("✅ SUPABASE_URL:", supabaseUrl);
console.log("✅ SUPABASE_KEY:", supabaseAnonKey ? "Loaded ✅" : "Missing ❌");

// ✅ Check if keys exist
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// ✅ Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
