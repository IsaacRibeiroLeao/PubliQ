"use client";

import { ProfileSettingsForm } from "@/components/ProfileSettingsForm";
import { useProfile } from "@/hooks/useProfile";

export function ProfileSettings() {
  const { profile, refresh } = useProfile();
  if (!profile) {
    return null;
  }
  return <ProfileSettingsForm key={profile.id} profile={profile} onSaved={refresh} />;
}
