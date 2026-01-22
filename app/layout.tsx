import type { Metadata } from "next";
import { Header } from "@/presentation/components/layout/Header";
import { Footer } from "@/presentation/components/layout/Footer";
import { BackgroundProvider } from "@/presentation/context/BackgroundContext";
import { BackgroundWrapper } from "@/presentation/components/layout/BackgroundWrapper";
import { WagmiProvider } from "@/infrastructure/blockchain/providers/WagmiProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.optimismprime.io'),

  title: {
    default: 'Optimism Prime — DeFi Yield & Incentives on Optimism',
    template: '%s | Optimism Prime',
  },

  description:
    'Optimism Prime is a DeFi protocol on Optimism focused on sustainable yield, incentives optimization, and long-term liquidity alignment.',

  keywords: [
    'Optimism',
    'DeFi',
    'Yield Farming',
    'Liquidity',
    'Web3',
    'Crypto',
    'OP Stack',
    'Optimism Prime',
    'Staking',
  ],

  openGraph: {
    type: 'website',
    url: 'https://www.optimismprime.io',
    title: 'Optimism Prime — DeFi Yield on Optimism',
    description:
      'Earn sustainable yield and optimize incentives with Optimism Prime, a next-generation DeFi protocol on Optimism.',
    siteName: 'Optimism Prime',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Optimism Prime — DeFi Protocol on Optimism',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@Optimism_Pr',
    title: 'Optimism Prime — DeFi Yield on Optimism',
    description:
      'Earn sustainable yield and optimize incentives with Optimism Prime, built on Optimism.',
    images: ['/og-image.jpg'],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider>
          <BackgroundProvider>
            <BackgroundWrapper>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </BackgroundWrapper>
          </BackgroundProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}