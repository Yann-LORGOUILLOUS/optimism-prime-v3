'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Twitter from '@/presentation/components/common/Twitter';
import Discord from '@/presentation/components/common/Discord';
import Medium from '@/presentation/components/common/Medium';
import { EXTERNAL_LINKS } from '@/infrastructure/config/externalLinks';

const ConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then((m) => m.ConnectButton),
  {
    ssr: false,
    loading: () => (
      <button
        type="button"
        className="px-5 py-2 rounded-full border border-white/20 text-white/70 text-sm bg-white/5"
        aria-label="Loading wallet connector"
      >
        CONNECT
      </button>
    ),
  }
);

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = useMemo(
    () => [
      { href: '/', label: 'DASHBOARD' },
      { href: '/opp', label: '$OPP' },
      { href: '/earn', label: 'EARN' },
      { href: '/autobribes', label: 'AUTOBRIBES' },
      { href: '/roadmap', label: 'ROADMAP' },
      { href: '/backgrounds', label: 'BACKGROUNDS' },
    ],
    []
  );

  return (
    <header className="bg-linear-to-b from-black/90 to-transparent backdrop-blur-sm">
      <div className="max-w-480 mx-auto px-4 md:px-12 py-4">
        <nav className="flex items-center justify-between" aria-label="Primary navigation">
          <Link href="/" className="flex items-center group" aria-label="Go to dashboard">
            <div className="relative">
              <Image
                src="/logo_round.png"
                alt="Optimism Prime logo"
                width={64}
                height={64}
                className="w-12 h-12 md:w-16 md:h-16 group-hover:scale-105 transition-transform"
                priority
              />
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div
              className="ml-3 md:ml-4 text-white text-xl md:text-2xl lg:text-3xl tracking-wider"
              style={{ fontFamily: 'Transformers, sans-serif' }}
            >
              <span className="italic mr-2 text-white/90">OPTIMISM</span>
              <span className="text-white">PRIME</span>
            </div>
          </Link>

          <div className="hidden xl:flex items-center gap-2">
            {navLinks.map((link) => {
              const active = isActivePath(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`
                    text-white/80 text-sm font-medium tracking-wide
                    px-4 py-2 rounded-full
                    transition-all duration-200
                    ${
                      active
                        ? 'bg-red-500/20 text-white border border-red-500/40 shadow-[0_0_16px_rgba(239,68,68,0.18)]'
                        : 'hover:bg-white/10 hover:text-white'
                    }
                  `}
                   onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}

            <a
              href={EXTERNAL_LINKS.buyOpp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-sm font-medium tracking-wide
                px-5 py-2 rounded-full
                border border-red-500/50
                hover:bg-red-500/20 hover:border-red-500
                hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]
                transition-all duration-300"
              aria-label="Buy OPP on Velodrome (opens in new tab)"
            >
              BUY $OPP
            </a>

            <ConnectButton 
              label="CONNECT WALLET"
              accountStatus="address" 
              chainStatus="icon"
              showBalance={false}
            />

            <div className="flex items-center gap-1 ml-2" aria-label="Social links">
              <a
                href={EXTERNAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Optimism Prime on Twitter (opens in new tab)"
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Twitter />
              </a>
              <a
                href={EXTERNAL_LINKS.discord}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join Optimism Prime Discord (opens in new tab)"
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Discord />
              </a>
              <a
                href={EXTERNAL_LINKS.medium}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Read Optimism Prime on Medium (opens in new tab)"
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Medium />
              </a>
            </div>
          </div>

          <button
            type="button"
            className="xl:hidden text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </nav>

        {isMenuOpen && (
          <div id="mobile-menu" className="xl:hidden mt-4 pb-6 border-t border-white/10 pt-6">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const active = isActivePath(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`
                      text-white/80 text-sm font-medium tracking-wide
                      px-4 py-3 rounded-full text-center
                      transition-all duration-200
                      border border-white/10
                      ${
                        active
                          ? 'bg-red-500/20 text-white border-red-500/40 shadow-[0_0_16px_rgba(239,68,68,0.18)]'
                          : 'hover:bg-white/10 hover:text-white'
                      }
                    `}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="flex flex-col gap-3 mt-4 px-4">
                <a
                  href={EXTERNAL_LINKS.buyOpp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-sm font-medium tracking-wide text-center
                    px-5 py-3 rounded-full
                    border border-red-500/50
                    hover:bg-red-500/20 hover:border-red-500
                    transition-all duration-300"
                  aria-label="Buy OPP on Velodrome (opens in new tab)"
                >
                  BUY $OPP
                </a>

                <div className="flex justify-center">
                  <ConnectButton 
                    accountStatus="address" 
                    chainStatus="icon"
                    showBalance={false}
                  />
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-6" aria-label="Social links">
                <a
                  href={EXTERNAL_LINKS.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open Optimism Prime on Twitter (opens in new tab)"
                  className="p-3 rounded-full hover:bg-white/10 transition-colors"
                >
                  <Twitter />
                </a>
                <a
                  href={EXTERNAL_LINKS.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join Optimism Prime Discord (opens in new tab)"
                  className="p-3 rounded-full hover:bg-white/10 transition-colors"
                >
                  <Discord />
                </a>
                <a
                  href={EXTERNAL_LINKS.medium}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Read Optimism Prime on Medium (opens in new tab)"
                  className="p-3 rounded-full hover:bg-white/10 transition-colors"
                >
                  <Medium />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
