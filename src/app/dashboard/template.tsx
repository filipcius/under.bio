"use client";

import { usePathname } from "next/navigation";

/**
 * No Framer Motion here — transform/filter on a page wrapper
 * break sticky/fixed for preview + save dock.
 */
export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="ub-page-enter flex min-h-0 flex-1 flex-col">
      {children}
    </div>
  );
}
