'use client';

import { ReactNode, useEffect } from 'react';
import { useBackground } from '@/presentation/context/BackgroundContext';

export function BackgroundWrapper({ children }: { children: ReactNode }) {
  const { backgroundIndex } = useBackground();

  useEffect(() => {
    const img = String(backgroundIndex).padStart(3, '0');
    document.documentElement.style.setProperty(
      '--app-bg-url',
      `url(/backgrounds/${img}.jpg)`
    );
  }, [backgroundIndex]);

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: 'var(--app-bg-url)' }}
      />

      <div aria-hidden className="fixed inset-0 -z-10 bg-black/50" />

      <div className="relative z-0 min-h-screen flex flex-col">
        {children}
      </div>
    </>
  );
}
