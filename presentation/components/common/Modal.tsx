"use client";

import { ReactNode, MouseEvent } from "react";

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}

export function Modal({ children, isOpen, onClose, className = "" }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!onClose) return;
    
    const target = event.target as Element;
    const isBackdropClick = !target.closest(".modal-content");
    
    if (isBackdropClick) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md cursor-pointer"
      onClick={handleBackdropClick}
    >
      <div
        className={`modal-content bg-black/90 p-6 shadow-[0_0_30px_rgba(255,255,255,0.3)] text-white cursor-auto flex flex-col gap-4 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}