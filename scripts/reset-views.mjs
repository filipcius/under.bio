import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const raw = readFileSync(resolve("C:/Users/maras/under.bio/.env.local"), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i === -1) continue;
    env[line.slice(0, i)] = line.slice(i + 1);
  }
  return env;
}

const env = loadEnv();
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: profile, error } = await supabase
  .from("profiles")
  .select("id, slug")
  .eq("slug", "1f3llas")
  .maybeSingle();

if (error || !profile) throw error || new Error("profile missing");

const { data: page } = await supabase
  .from("pages")
  .select("id")
  .eq("profile_id", profile.id)
  .single();

await supabase.from("pages").update({ total_views: 0 }).eq("id", page.id);
await supabase.from("page_views").delete().eq("page_id", page.id);

console.log("Views reset for", profile.slug);
