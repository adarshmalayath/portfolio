/*
  Supabase SQL configuration.
  Fill these values from Supabase -> Project Settings -> API
*/
export const supabaseConfig = {
  url: "REPLACE_ME_SUPABASE_URL",
  anonKey: "REPLACE_ME_SUPABASE_ANON_KEY"
};

/*
  Admin allowlist (Google account emails).
  Keep only your private admin email here.
*/
export const supabaseAdmin = {
  allowedEmails: ["adarshmalayath@gmail.com"],
  allowedIds: []
};

function isSupabaseUrl(value) {
  return (
    typeof value === "string" &&
    value.startsWith("https://") &&
    value.includes(".supabase.co")
  );
}

export const supabaseReady =
  isSupabaseUrl(supabaseConfig.url) &&
  typeof supabaseConfig.anonKey === "string" &&
  !supabaseConfig.anonKey.includes("REPLACE_ME") &&
  supabaseConfig.anonKey.length > 20;
