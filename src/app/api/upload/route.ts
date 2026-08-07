import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/security";

const ALLOWED: Record<string, { mime: string[]; max: number; folder: string }> = {
  banner: {
    mime: ["image/png", "image/jpeg", "image/webp", "image/gif", "video/mp4"],
    max: 20 * 1024 * 1024,
    folder: "banner",
  },
  background: {
    mime: ["image/png", "image/jpeg", "image/webp", "image/gif", "video/mp4"],
    max: 40 * 1024 * 1024,
    folder: "background",
  },
  cover: {
    mime: ["image/png", "image/jpeg", "image/webp", "image/gif"],
    max: 5 * 1024 * 1024,
    folder: "cover",
  },
  audio: {
    mime: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm"],
    max: 15 * 1024 * 1024,
    folder: "audio",
  },
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.profileId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(`upload:${session.user.profileId}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Rate limited. Retry in ${limited.retryAfterSec}s` },
      { status: 429 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") || "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const rule = ALLOWED[kind];
  if (!rule) {
    return NextResponse.json({ error: "Invalid upload kind" }, { status: 400 });
  }

  if (!rule.mime.includes(file.type)) {
    return NextResponse.json({ error: `Unsupported type: ${file.type}` }, { status: 400 });
  }

  if (file.size > rule.max) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${session.user.profileId}/${rule.folder}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const admin = createAdminClient();

  const { error } = await admin.storage.from("profile-media").upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message || "Upload failed. Create storage bucket profile-media." },
      { status: 500 },
    );
  }

  const { data } = admin.storage.from("profile-media").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
