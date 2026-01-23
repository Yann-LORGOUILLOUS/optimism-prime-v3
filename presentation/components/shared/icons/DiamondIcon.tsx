import { memo } from "react";

interface IconProps {
  className?: string;
}

function DiamondIconComponent({ className = "" }: IconProps) {
  return (
    <svg
      className={`w-6 h-6 text-red-400 ${className}`}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2L2 9l10 13 10-13-10-7zm0 2.5L18.5 9 12 19.5 5.5 9 12 4.5z" />
      <path d="M12 6L7 9.5 12 17l5-7.5L12 6z" fillOpacity="0.3" />
    </svg>
  );
}

export const DiamondIcon = memo(DiamondIconComponent);
