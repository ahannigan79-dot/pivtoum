"use client";
import { usePathname } from "next/navigation";

/** Renders marketing chrome everywhere EXCEPT the member platform at /hub. */
export function HideOnHub({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/hub")) return null;
  return <>{children}</>;
}
