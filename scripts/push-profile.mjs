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

const config = JSON.parse(
  readFileSync(resolve("C:/Users/maras/under.bio/profiles/1f3llas.json"), "utf8"),
);

const { data: profile, error: pErr } = await supabase
  .from("profiles")
  .select("id, slug")
  .eq("slug", "1f3llas")
  .maybeSingle();

if (pErr) throw pErr;
if (!profile) {
  console.error("Profile slug 1f3llas not found. Login once first.");
  process.exit(1);
}

const { error } = await supabase
  .from("pages")
  .update({ config })
  .eq("profile_id", profile.id);

if (error) throw error;
console.log("Updated page config for", profile.slug);
