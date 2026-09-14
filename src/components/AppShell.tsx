"use client";

import type { ReactNode } from "react";
import { AppShellFrame } from "@/components/AppShellFrame";
import { ProfileProvider } from "@/hooks/useProfile";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <AppShellFrame>{children}</AppShellFrame>
    </ProfileProvider>
  );
}
