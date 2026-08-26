import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasCredentials = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasCredentials) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — " +
      "Supabase features will be unavailable. Add them to your .env file to enable."
  );
}

function makeNoOpProxy() {
  const handler = {
    get() {
      return new Proxy(noop, handler);
    },
  };
  const noop = () => {
    throw new Error(
      "Supabase is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
    );
  };
  return new Proxy({}, handler);
}

export const supabase = hasCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : makeNoOpProxy();
