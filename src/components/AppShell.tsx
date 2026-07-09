"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isLandingPage = pathname === "/";
  const isAuthPage =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password");

  const noSidebarGutter = isLandingPage || isAuthPage;

  return (
    <>
      <Sidebar />
      <div className={noSidebarGutter ? "" : "md:pl-60"}>
        <div className={isLandingPage ? "" : "max-w-md md:max-w-4xl mx-auto relative"}>
          {children}
        </div>
      </div>
    </>
  );
}
