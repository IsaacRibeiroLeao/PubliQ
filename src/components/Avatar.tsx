export interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-8 w-8 text-[13px]",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({ imageUrl, name, size = "md" }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  if (imageUrl) {
    return (
      <span
        role="img"
        aria-label={name}
        className={`${sizes[size]} inline-block rounded-full bg-cover bg-center`}
        style={{ backgroundImage: `url("${imageUrl}")` }}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={`${sizes[size]} inline-flex shrink-0 items-center justify-center rounded-full bg-signal-soft font-semibold text-signal`}
    >
      {initials}
    </span>
  );
}
