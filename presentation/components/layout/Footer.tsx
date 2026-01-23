'use client';

import Twitter from '@/presentation/components/common/Twitter';
import Discord from '@/presentation/components/common/Discord';
import Medium from '@/presentation/components/common/Medium';
import { EXTERNAL_LINKS } from '@/infrastructure/config/externalLinks';

export function Footer() {
  return (
    <footer className="bg-linear-to-t from-black/90 to-transparent backdrop-blur-sm mt-auto">
      <div className="max-w-480 mx-auto px-4 md:px-12 py-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-1">
            <a 
              href={EXTERNAL_LINKS.twitter} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Twitter />
            </a>
            <a 
              href={EXTERNAL_LINKS.discord} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Discord />
            </a>
            <a 
              href={EXTERNAL_LINKS.medium} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Medium />
            </a>
          </div>

          <p className="text-white/50 text-sm tracking-wide">
            © 2026 OPTIMISM PRIME. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
