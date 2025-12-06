import dotenv from "dotenv";
dotenv.config({ path: './.env' });

import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error("SUPABASE_URL y SUPABASE_KEY son requeridos");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default supabase;   // <--- AQUÍ ESTÁ EL CAMBIO
