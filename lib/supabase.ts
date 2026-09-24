import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as unknown as {
  supabaseAdmin?: SupabaseClient;
};

/**
 * Server-only Supabase client, authenticated with the service role key.
 * Never import this from a Client Component or expose the key to the browser.
 */
export function getSupabaseAdmin() {
  if (globalForSupabase.supabaseAdmin) return globalForSupabase.supabaseAdmin;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to upload or manage media."
    );
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (process.env.NODE_ENV !== "production") globalForSupabase.supabaseAdmin = client;
  return client;
}

export function getStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || "selecta-media";
}
