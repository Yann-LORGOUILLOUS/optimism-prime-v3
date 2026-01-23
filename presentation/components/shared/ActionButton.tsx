import { memo, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

interface ActionButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
  lg: "px-8 py-3 text-lg",
};

const VARIANT_CLASSES: Record<ButtonVariant, { enabled: string; disabled: string }> = {
  primary: {
    enabled: "bg-red-500/20 text-white border border-red-500/40 hover:bg-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]",
    disabled: "bg-gray-600/50 text-white/40 cursor-not-allowed",
  },
  secondary: {
    enabled: "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10",
    disabled: "bg-gray-600/50 text-white/40 cursor-not-allowed",
  },
};

function ActionButtonComponent({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
}: ActionButtonProps) {
  const sizeClass = SIZE_CLASSES[size];
  const variantClass = disabled 
    ? VARIANT_CLASSES[variant].disabled 
    : VARIANT_CLASSES[variant].enabled;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full font-medium transition-all duration-300 ${sizeClass} ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
}

export const ActionButton = memo(ActionButtonComponent);
