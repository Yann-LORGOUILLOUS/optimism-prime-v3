import { memo } from "react";

interface IconProps {
  className?: string;
}

function CloseIconComponent({ className = "" }: IconProps) {
  return (
    <svg
      className={`w-6 h-6 ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export const CloseIcon = memo(CloseIconComponent);
