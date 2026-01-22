'use client';

import { StatsCircle } from "@/presentation/components/home/StatsCircle";
import { useTokenStats } from '@/presentation/hooks/useTokenStats';
import { useLockedVelo } from '@/presentation/hooks/useLockedVelo';

export default function Home() {
  const { stats, isLoading } = useTokenStats();
  const { lockedVelo, isLoading: isLoadingVelo } = useLockedVelo();

  const marketStats = [
    { label: "MKT CAP", value: isLoading ? "..." : `$${Number(stats?.marketCap).toLocaleString('en-US')}` },
    { label: "VOLUME", value: isLoading ? "..." : `$${Number(stats?.volume24h).toLocaleString('en-US')}` },
  ];

  const priceStats = [
    { label: "USD PRICE", value: isLoading ? "..." : `$${stats?.priceUsd}` },
    { label: "LOCKED VELO", value: isLoadingVelo ? "..." : lockedVelo || "---" },
  ];

  return (
    <div className="w-full flex flex-col items-center px-4 py-12">
      <h1 
        className="text-4xl md:text-5xl text-white/90 mb-6 tracking-wider text-center"
        style={{ fontFamily: 'Transformers, sans-serif' }}
      >
        DASHBOARD
      </h1>

      <div className="w-24 h-0.5 bg-linear-to-r from-transparent via-red-500 to-transparent mb-12" />

      <div className="flex justify-center items-center w-full max-w-480 min-h-[60vh] flex-wrap gap-12 md:gap-24 xl:gap-100">
        <StatsCircle stats={marketStats} index={0} />
        <StatsCircle stats={priceStats} index={1} />
      </div>
    </div>
  );
}