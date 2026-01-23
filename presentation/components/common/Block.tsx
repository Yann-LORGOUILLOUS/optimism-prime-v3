import { ReactNode } from "react";

interface BlockProps {
  children: ReactNode;
  className?: string;
}

export function Block({ children, className = "" }: BlockProps) {
  return (
    <div
      className={`flex flex-col w-full items-center p-6 bg-black/90 text-white gap-4 ${className}`}
    >
      {children}
    </div>
  );
}