import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// TEMP DEBUG — remove after fixing the 401
console.log("SUPABASE_URL:", supabaseUrl);
console.log("ANON_KEY prefix:", supabaseAnonKey?.slice(0, 20));
console.log("ANON_KEY length:", supabaseAnonKey?.length);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars — check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);