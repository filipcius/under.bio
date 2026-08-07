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

const { data: buckets } = await supabase.storage.listBuckets();
const exists = (buckets || []).some((b) => b.name === "profile-media");

if (!exists) {
  const { error } = await supabase.storage.createBucket("profile-media", {
    public: true,
    fileSizeLimit: 25 * 1024 * 1024,
  });
  if (error) {
    console.error("createBucket failed:", error.message);
    process.exit(1);
  }
  console.log("Created bucket profile-media");
} else {
  console.log("Bucket profile-media already exists");
}
