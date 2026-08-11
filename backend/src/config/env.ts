import dotenv from "dotenv";

dotenv.config();

const required = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const port = process.env.PORT ? Number(process.env.PORT) : 5000;
if (process.env.PORT && (!Number.isInteger(port) || port < 1 || port > 65535)) {
  throw new Error("Invalid PORT configuration: must be a number between 1 and 65535.");
}

export const env = {
  port,
  supabaseUrl: process.env.SUPABASE_URL as string,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY as string,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
};
