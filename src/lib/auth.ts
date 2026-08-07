import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { getServerEnv } from "@/lib/env";
import { fetchDiscordUser, isGuildMember, mapDiscordProfile } from "@/lib/discord";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_PROFILE_TEMPLATE,
  mergeTemplate,
} from "@/lib/profile-template";
import type { ProfileRow } from "@/lib/supabase/types";
import { slugify } from "@/lib/utils";

async function ensureUniqueSlug(base: string, excludeProfileId?: string) {
  const admin = createAdminClient();
  let candidate = slugify(base);

  for (let i = 0; i < 50; i++) {
    const trySlug =
      i === 0
        ? candidate
        : slugify(`${candidate.slice(0, 20)}${i + 1}`);
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("slug", trySlug)
      .maybeSingle();

    const row = data as { id: string } | null;
    if (!row || (excludeProfileId && row.id === excludeProfileId)) {
      return trySlug;
    }
  }

  return `u${Date.now().toString(36)}`.slice(0, 25);
}

async function upsertProfileFromDiscord(accessToken: string): Promise<ProfileRow> {
  const user = await fetchDiscordUser(accessToken);
  const member = await isGuildMember(user.id);
  if (!member) {
    throw new Error("NOT_IN_GUILD");
  }

  const mapped = mapDiscordProfile(user);
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("profiles")
    .select("*")
    .eq("discord_id", mapped.discord_id)
    .maybeSingle();

  if (existing) {
    const current = existing as ProfileRow;
    const { data: updated, error } = await admin
      .from("profiles")
      .update({
        username: mapped.username,
        global_name: mapped.global_name,
        avatar_hash: mapped.avatar_hash,
        avatar_url: mapped.avatar_url,
        banner_url: mapped.banner_url,
        accent_color: mapped.accent_color,
        email: mapped.email,
        discriminator: mapped.discriminator,
        locale: mapped.locale,
        verified: mapped.verified,
        mfa_enabled: mapped.mfa_enabled,
        premium_type: mapped.premium_type,
        public_flags: mapped.public_flags,
        discord_raw: mapped.discord_raw,
      })
      .eq("id", current.id)
      .select("*")
      .single();

    if (error || !updated) throw error ?? new Error("Profile update failed");
    return updated as ProfileRow;
  }

  const slug = await ensureUniqueSlug(mapped.suggested_slug);
  const { data: created, error } = await admin
    .from("profiles")
    .insert({
      discord_id: mapped.discord_id,
      username: mapped.username,
      global_name: mapped.global_name,
      avatar_hash: mapped.avatar_hash,
      avatar_url: mapped.avatar_url,
      banner_url: mapped.banner_url,
      accent_color: mapped.accent_color,
      email: mapped.email,
      discriminator: mapped.discriminator,
      locale: mapped.locale,
      verified: mapped.verified,
      mfa_enabled: mapped.mfa_enabled,
      premium_type: mapped.premium_type,
      public_flags: mapped.public_flags,
      slug,
      discord_raw: mapped.discord_raw,
    })
    .select("*")
    .single();

  if (error || !created) throw error ?? new Error("Profile create failed");
  const profile = created as ProfileRow;

  const config = mergeTemplate(DEFAULT_PROFILE_TEMPLATE, {
    meta: {
      ...DEFAULT_PROFILE_TEMPLATE.meta,
      slug: profile.slug,
      displayName: profile.global_name || profile.username,
      pageTitle: `${profile.slug} | under.bio`,
    },
  });

  const { error: pageError } = await admin.from("pages").insert({
    profile_id: profile.id,
    config,
    published: true,
  });

  if (pageError) throw pageError;
  return profile;
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const env = {
    AUTH_SECRET: process.env.AUTH_SECRET || "build-placeholder-secret",
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID || "build",
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET || "build",
  };

  return {
    trustHost: true,
    secret: env.AUTH_SECRET,
    session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
    providers: [
      Discord({
        clientId: env.AUTH_DISCORD_ID,
        clientSecret: env.AUTH_DISCORD_SECRET,
        authorization: {
          params: {
            scope: "identify email guilds.members.read",
          },
        },
      }),
    ],
    callbacks: {
      async signIn({ account }) {
        if (!account?.access_token) return false;
        getServerEnv();
        try {
          await upsertProfileFromDiscord(account.access_token);
          return true;
        } catch (error) {
          if (error instanceof Error && error.message === "NOT_IN_GUILD") {
            return "/login?error=not_in_server";
          }
          console.error("Discord sign-in failed", error);
          return "/login?error=auth_failed";
        }
      },
      async jwt({ token, account }) {
        if (account?.access_token) {
          try {
            getServerEnv();
            const profile = await upsertProfileFromDiscord(account.access_token);
            token.discordId = profile.discord_id;
            token.profileId = profile.id;
            token.slug = profile.slug;
            token.uid = profile.uid;
            token.name = profile.global_name || profile.username;
            token.picture = profile.avatar_url ?? undefined;
            token.email = profile.email ?? undefined;
          } catch (error) {
            console.error("JWT profile sync failed", error);
          }
        } else if (token.discordId) {
          try {
            const admin = createAdminClient();
            const { data } = await admin
              .from("profiles")
              .select("id, slug, uid, global_name, username, avatar_url, email")
              .eq("discord_id", token.discordId)
              .maybeSingle();
            const row = data as Pick<
              ProfileRow,
              "id" | "slug" | "uid" | "global_name" | "username" | "avatar_url" | "email"
            > | null;
            if (row) {
              token.profileId = row.id;
              token.slug = row.slug;
              token.uid = row.uid;
              token.name = row.global_name || row.username;
              token.picture = row.avatar_url ?? undefined;
              token.email = row.email ?? undefined;
            }
          } catch {
            // ignore refresh failures
          }
        }
        return token;
      },
      async session({ session, token }) {
        session.user.id = String(token.profileId ?? token.sub ?? "");
        session.user.discordId = String(token.discordId ?? "");
        session.user.profileId = String(token.profileId ?? "");
        session.user.slug = String(token.slug ?? "");
        session.user.uid = Number(token.uid ?? 0);
        if (token.name) session.user.name = token.name;
        if (typeof token.picture === "string") session.user.image = token.picture;
        if (typeof token.email === "string") session.user.email = token.email;
        return session;
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
  };
});
