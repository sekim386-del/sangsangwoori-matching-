import { createClient } from "@supabase/supabase-js";

function clean(v: string | undefined): string {
  if (!v) return v as string;
  // Strip UTF-16 BOM (U+FEFF) that PowerShell may have prepended when setting the env var
  return v.charCodeAt(0) === 0xFEFF ? v.slice(1) : v;
}

const supabaseUrl = clean(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!;
const supabaseAnonKey = clean(process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
