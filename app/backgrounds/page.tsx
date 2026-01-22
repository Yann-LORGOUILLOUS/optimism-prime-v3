'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { useBackground } from '@/presentation/context/BackgroundContext';

export default function BackgroundsPage() {
  const { backgroundIndex, setBackgroundIndex } = useBackground();

  const backgrounds = useMemo(() => Array.from({ length: 44 }, (_, i) => i), []);

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center px-4 py-12">
      <h1
        className="text-4xl md:text-5xl text-white/90 mb-6 tracking-wider text-center"
        style={{ fontFamily: 'Transformers, sans-serif' }}
      >
        BACKGROUNDS
      </h1>

      <div className="w-24 h-0.5 bg-linear-to-r from-transparent via-red-500 to-transparent mb-12" />

      <div className="max-w-7xl w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {backgrounds.map((index) => {
          const imgNumber = String(index).padStart(3, '0');
          const imgPath = `/backgrounds/${imgNumber}.jpg`;
          const isSelected = backgroundIndex === index;

          return (
            <button
              key={index}
              type="button"
              onClick={() => setBackgroundIndex(index)}
              className={`
                relative group cursor-pointer text-left
                bg-linear-to-br from-black/70 via-black/50 to-black/70
                backdrop-blur-xl
                border
                ${isSelected ? 'border-red-500' : 'border-white/10'}
                rounded-xl overflow-hidden
                hover:border-red-500/50
                transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-red-500/50
              `}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-red-500 rounded-full text-white text-xs font-mono">
                  ACTIVE
                </div>
              )}

              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={imgPath}
                  alt={`Background ${index}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  quality={60}
                  loading="lazy"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-sm font-mono tracking-wide">
                    CLICK TO APPLY
                  </span>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <span className="text-white/80 text-sm font-mono">
                  BACKGROUND {index}
                </span>
                <span className="text-red-500/50 text-xs font-mono">
                  [{imgNumber}]
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
