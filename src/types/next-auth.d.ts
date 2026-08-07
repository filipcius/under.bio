import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      discordId: string;
      profileId: string;
      slug: string;
      uid: number;
      isBlack: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    discordId?: string;
    profileId?: string;
    slug?: string;
    uid?: number;
    isBlack?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId?: string;
    profileId?: string;
    slug?: string;
    uid?: number;
    isBlack?: boolean;
    syncedAt?: number;
  }
}
