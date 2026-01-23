import { memo } from "react";

type ChevronDirection = "up" | "down";
type ChevronSize = "sm" | "md";

interface ChevronIconProps {
  direction: ChevronDirection;
  size?: ChevronSize;
}

const SIZE_CLASSES: Record<ChevronSize, string> = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
};

function ChevronIconComponent({ direction, size = "md" }: ChevronIconProps) {
  const sizeClass = SIZE_CLASSES[size];
  const rotateClass = direction === "up" ? "rotate-180" : "";

  return (
    <svg
      className={`${sizeClass} text-white/60 transition-transform ${rotateClass}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export const ChevronIcon = memo(ChevronIconComponent);
