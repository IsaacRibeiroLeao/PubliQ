const LOCAL_ORIGIN = "https://publiq.local";

export function getSafeRedirectPath(
  redirectPath: string | null | undefined,
  fallback = "/",
): string {
  if (
    !redirectPath ||
    !redirectPath.startsWith("/") ||
    redirectPath.startsWith("//") ||
    redirectPath.includes("\\") ||
    /[\u0000-\u001f\u007f]/u.test(redirectPath)
  ) {
    return fallback;
  }

  try {
    const target = new URL(redirectPath, LOCAL_ORIGIN);
    return target.origin === LOCAL_ORIGIN
      ? `${target.pathname}${target.search}${target.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
