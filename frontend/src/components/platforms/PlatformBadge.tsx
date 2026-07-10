import { PLATFORM_META } from "../../lib/platforms";

type Props = {
  platform: string;
  size?: "sm" | "md";
};

export function PlatformBadge({ platform, size = "sm" }: Props) {
  const meta = PLATFORM_META[platform] ?? {
    label: platform,
    color: "#334155",
    icon: "?",
  };

  const compact = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium text-white ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
      style={{ backgroundColor: meta.color }}
    >
      <span className="font-bold">{meta.icon}</span>
      {meta.label}
    </span>
  );
}

type IconProps = {
  platform: string;
  className?: string;
};

export function PlatformIcon({ platform, className = "h-8 w-8 text-sm" }: IconProps) {
  const meta = PLATFORM_META[platform] ?? {
    label: platform,
    color: "#334155",
    icon: "?",
  };

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg font-bold text-white ${className}`}
      style={{ backgroundColor: meta.color }}
      title={meta.label}
    >
      {meta.icon}
    </div>
  );
}
