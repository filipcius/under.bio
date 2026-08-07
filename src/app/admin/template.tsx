"use client";

import { usePathname } from "next/navigation";

export default function AdminTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="ub-page-enter">
      {children}
    </div>
  );
}
