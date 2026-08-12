import { createClient } from "@supabase/supabase-js";
import { env } from "./env";
import { Database } from "../types/database.types";

export const supabaseAdmin = createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
