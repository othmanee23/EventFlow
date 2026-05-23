import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function getSupabaseConfig() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return { supabaseKey, supabaseUrl };
}

export const createClient = () => {
  const { supabaseKey, supabaseUrl } = getSupabaseConfig();
  return createBrowserClient(supabaseUrl, supabaseKey);
};
