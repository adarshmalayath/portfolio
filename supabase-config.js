/*
  Supabase SQL configuration.
  Fill these values from Supabase -> Project Settings -> API
*/
export const supabaseConfig = {
  url: "https://cryqcnywbzcqfkpnhpoy.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyeXFjbnl3YnpjcWZrcG5ocG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTU4NjksImV4cCI6MjA4NjY3MTg2OX0.8zbh5__pztt6FbGCQn52-QwKevHoU9nYScumX5GgoGE"
};

/*
  Admin allowlist (Google account emails).
  Keep only your private admin email here.
*/
export const supabaseAdmin = {
  allowedEmails: ["adarshmalayath@gmail.com", "adarshmalayath@icloud.com"],
  allowedIds: []
};

function isSupabaseUrl(value) {
  return (
    typeof value === "string" &&
    value.startsWith("https://") &&
    value.includes(".supabase.co")
  );
}

function looksLikeSupabaseAnonKey(value) {
  return (
    typeof value === "string" &&
    value.startsWith("eyJ") &&
    value.length > 80
  );
}

export const supabaseReady =
  isSupabaseUrl(supabaseConfig.url) &&
  looksLikeSupabaseAnonKey(supabaseConfig.anonKey);
