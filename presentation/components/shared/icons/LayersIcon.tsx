import { memo } from "react";

interface IconProps {
  className?: string;
}

function LayersIconComponent({ className = "" }: IconProps) {
  return (
    <svg
      className={`w-6 h-6 text-white/60 ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75l-9.75-5.25 4.179-2.25m11.142 0l-5.571 3-5.571-3"
      />
    </svg>
  );
}

export const LayersIcon = memo(LayersIconComponent);
