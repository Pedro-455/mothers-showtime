import { createClient } from "@supabase/supabase-js";

// ⛔ IMPORTANT:
// Replace these two values with YOUR Supabase project values.
// You get them from: Supabase → Project Settings → API

const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
