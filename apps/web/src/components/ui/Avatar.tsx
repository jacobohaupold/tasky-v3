import { cn } from "@/lib/cn";

export type AvatarSize = "xs" | "sm" | "md" | "lg";
export type PresenceStatus = "online" | "away" | "offline" | "busy";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  presence?: PresenceStatus;
  className?: string;
  alt?: string;
}

const sizeMap: Record<AvatarSize, { container: string; text: string; dot: string }> = {
  xs: { container: "h-6 w-6",  text: "text-2xs", dot: "h-1.5 w-1.5 -bottom-px -right-px" },
  sm: { container: "h-8 w-8",  text: "text-xs",  dot: "h-2 w-2 bottom-0 right-0" },
  md: { container: "h-10 w-10", text: "text-sm",  dot: "h-2.5 w-2.5 bottom-0.5 right-0.5" },
  lg: { container: "h-16 w-16", text: "text-xl",  dot: "h-3.5 w-3.5 bottom-1 right-1" },
};

const presenceColors: Record<PresenceStatus, string> = {
  online:  "bg-green-400",
  away:    "bg-amber-400",
  offline: "bg-gray-300",
  busy:    "bg-red-400",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

function getColor(name: string): string {
  const colors = [
    "bg-indigo-100 text-indigo-700",
    "bg-purple-100 text-purple-700",
    "bg-pink-100 text-pink-700",
    "bg-blue-100 text-blue-700",
    "bg-teal-100 text-teal-700",
    "bg-green-100 text-green-700",
    "bg-amber-100 text-amber-700",
  ];
  const idx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
}

export function Avatar({
  src,
  name,
  size = "md",
  presence,
  className,
  alt,
}: AvatarProps) {
  const { container, text, dot } = sizeMap[size];
  const initials = name ? getInitials(name) : "?";
  const colorClass = name ? getColor(name) : "bg-surface-2 text-muted";

  return (
    <div className={cn("relative inline-flex flex-shrink-0", className)}>
      <div
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center font-semibold select-none",
          container,
          !src && colorClass
        )}
        aria-label={alt ?? name ?? "Avatar"}
        role="img"
      >
        {src ? (
          <img
            src={src}
            alt={alt ?? name ?? ""}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className={text}>{initials}</span>
        )}
      </div>

      {presence && (
        <span
          aria-label={presence}
          className={cn(
            "absolute rounded-full ring-2 ring-surface-1",
            dot,
            presenceColors[presence]
          )}
        />
      )}
    </div>
  );
}

// ── Avatar Group ──────────────────────────────────────────────────────────────
interface AvatarGroupProps {
  avatars: Array<{ src?: string | null; name?: string | null }>;
  max?: number;
  size?: AvatarSize;
}

export function AvatarGroup({ avatars, max = 4, size = "sm" }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;
  const { container, text } = sizeMap[size];

  return (
    <div className="flex items-center -space-x-2" role="group" aria-label="Participantes">
      {visible.map((a, i) => (
        <div key={i} className="ring-2 ring-surface-1 rounded-full">
          <Avatar src={a.src} name={a.name} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "rounded-full ring-2 ring-surface-1 bg-surface-2 text-muted font-semibold",
            "flex items-center justify-center",
            container,
            text
          )}
          aria-label={`+${overflow} más`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
