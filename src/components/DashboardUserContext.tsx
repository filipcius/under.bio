"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DiscordAvatar } from "@/components/DiscordAvatar";

type DashboardUser = {
  name?: string | null;
  image?: string | null;
  /** Always shown in dashboard chrome — not gated by public visibility toggle */
  decorationUrl?: string | null;
  slug?: string;
};

const Ctx = createContext<DashboardUser>({});

export function DashboardUserProvider({
  user,
  children,
}: {
  user: DashboardUser;
  children: ReactNode;
}) {
  return <Ctx.Provider value={user}>{children}</Ctx.Provider>;
}

export function useDashboardUser() {
  return useContext(Ctx);
}

/** Dashboard avatars always include Discord decoration when available. */
export function DashboardAvatar({
  size,
  className,
  ringClassName,
  avatarUrl,
}: {
  size: number;
  className?: string;
  ringClassName?: string;
  /** Override session image (e.g. page-loaded profile.avatar_url) */
  avatarUrl?: string | null;
}) {
  const user = useDashboardUser();
  return (
    <DiscordAvatar
      avatarUrl={avatarUrl ?? user.image}
      decorationUrl={user.decorationUrl}
      size={size}
      className={className}
      ringClassName={ringClassName}
      borderRadius="50%"
    />
  );
}
