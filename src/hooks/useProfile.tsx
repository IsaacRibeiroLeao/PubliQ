"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Profile } from "@/types/database";
import { createClient } from "@/utils/supabase/client";

interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims.sub;
    if (!userId || typeof userId !== "string") {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile((data as Profile | null) ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getClaims().then(({ data: claims }) => {
      const userId = claims?.claims.sub;
      if (!userId || typeof userId !== "string") {
        setProfile(null);
        setLoading(false);
        return;
      }
      void supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()
        .then(({ data }) => {
          setProfile((data as Profile | null) ?? null);
          setLoading(false);
        });
    });
  }, []);

  const value = useMemo(() => ({ profile, loading, refresh }), [profile, loading, refresh]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile deve ser usado dentro de ProfileProvider.");
  }
  return context;
}
