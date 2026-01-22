'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type BackgroundContextType = {
  backgroundIndex: number;
  setBackgroundIndex: (index: number) => void;
};

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

function tryWriteToLocalStorage(index: number): void {
  try {
    localStorage.setItem('backgroundIndex', String(index));
  } catch {
    return;
  }
}

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [backgroundIndex, setBackgroundIndexState] = useState<number>(() => {
  if (typeof window === "undefined") return 0;
  const saved = localStorage.getItem("opp_backgroundIndex");
  if (!saved) return 0;

  const parsed = Number.parseInt(saved, 10);
  return Number.isFinite(parsed) ? parsed : 0;
});

  const setBackgroundIndex = (index: number) => {
    setBackgroundIndexState(index);
    tryWriteToLocalStorage(index);
  };

  return (
    <BackgroundContext.Provider value={{ backgroundIndex, setBackgroundIndex }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}
