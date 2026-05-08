import { createClient } from "@supabase/supabase-js";

// Strip UTF-16 BOM (U+FEFF) that PowerShell may prepend when setting env vars via CLI
function clean(v: string | undefined): string | undefined {
  if (!v) return undefined;
  return v.charCodeAt(0) === 0xFEFF ? v.slice(1) : v;
}

const supabaseUrl =
  clean(process.env.SUPABASE_URL) ??
  clean(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
  "https://placeholder.supabase.co";

const supabaseAnonKey =
  clean(process.env.SUPABASE_ANON_KEY) ??
  clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ??
  "placeholder-anon-key";

// createClient throws if given empty strings — use placeholders so module
// initialises safely even when env vars are absent (queries will fail gracefully).
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
