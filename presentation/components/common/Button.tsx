"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "disabled";
  size?: "small" | "medium" | "large";
}

export function Button({
  children,
  variant = "primary",
  size = "medium",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "flex items-center justify-center rounded-md font-transformers transition duration-300 ease-in-out";

  const variantStyles = {
    primary: "bg-blue-700 text-white hover:bg-blue-600 hover:scale-[1.02]",
    secondary: "bg-slate-900 text-gray-300 hover:bg-slate-800",
    disabled: "bg-slate-900 text-gray-700 opacity-80 cursor-not-allowed",
  };

  const sizeStyles = {
    small: "h-10 px-3 text-lg",
    medium: "h-14 px-4 text-2xl",
    large: "h-16 px-6 text-3xl",
  };

  const appliedVariant = disabled ? "disabled" : variant;

  return (
    <button
      className={`${baseStyles} ${variantStyles[appliedVariant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}