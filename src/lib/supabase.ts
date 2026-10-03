import { createClient } from "@supabase/supabase-js";

const configuredUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseUrl = configuredUrl?.startsWith("//")
  ? `https:${configuredUrl}`
  : configuredUrl;

let validUrl = false;

try {
  validUrl = Boolean(supabaseUrl && ["http:", "https:"].includes(new URL(supabaseUrl).protocol));
} catch {
  validUrl = false;
}

export const supabaseConfigError = !validUrl || !supabaseAnonKey
  ? "Supabase is not configured correctly. Set VITE_SUPABASE_URL to https://psiiybumwyyoreoufcps.supabase.co and add VITE_SUPABASE_ANON_KEY in Netlify, then redeploy."
  : null;

export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl as string, supabaseAnonKey);
