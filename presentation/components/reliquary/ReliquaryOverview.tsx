"use client";

import { Block } from "../common/Block";
import { ExternalLink } from "../common/ExternalLink";
import { PoolCard } from "./PoolCard";
import { APR } from "../../../domain/reliquary/value-objects/APR";

interface PoolData {
  index: number;
  name: string;
  tvlUsd: number;
  apr: APR;
  isActive: boolean;
}

interface ReliquaryOverviewProps {
  title: string;
  contractAddress: string;
  explorerUrl: string;
  rewardTokenName: string;
  rewardTokenSymbol: string;
  rewardTokenAddress: string;
  tvlUsd: number;
  averageApr: APR;
  weeklyRewardRate: number;
  weeklyRewardRateUsd: number;
  pools: PoolData[];
  showInactivePools: boolean;
  onToggleInactivePools: () => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export function ReliquaryOverview({
  title,
  contractAddress,
  explorerUrl,
  rewardTokenName,
  rewardTokenSymbol,
  rewardTokenAddress,
  tvlUsd,
  averageApr,
  weeklyRewardRate,
  weeklyRewardRateUsd,
  pools,
  showInactivePools,
  onToggleInactivePools,
  isLoading,
  onRefresh,
}: ReliquaryOverviewProps) {
  const visiblePools = showInactivePools 
    ? pools 
    : pools.filter((pool) => pool.isActive);

  return (
    <Block>
      <div className="flex items-center gap-2">
        <h2 className="text-3xl font-transformers">{title}</h2>
        <button
          onClick={onRefresh}
          className="text-xl hover:opacity-70"
          disabled={isLoading}
        >
          <i className={`fa fa-refresh ${isLoading ? "fa-spin" : ""}`} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-1">
        <p>
          Contract:{" "}
          <ExternalLink href={`${explorerUrl}/address/${contractAddress}`}>
            {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
          </ExternalLink>
        </p>

        <p>
          Reward token:{" "}
          <ExternalLink href={`${explorerUrl}/token/${rewardTokenAddress}`}>
            {rewardTokenName} ({rewardTokenSymbol})
          </ExternalLink>
        </p>

        <p>TVL: ${tvlUsd.toFixed(2)}</p>

        <p className="bg-blue-800 px-3 py-1">
          Average APR: {averageApr.displayWithSymbol()}
        </p>

        <p>Reward rate:</p>
        <p>
          ${weeklyRewardRateUsd.toFixed(2)} / week ({weeklyRewardRate.toFixed(3)} {rewardTokenSymbol})
        </p>

        <label className="flex items-center gap-2 cursor-pointer mt-2">
          <input
            type="checkbox"
            checked={showInactivePools}
            onChange={onToggleInactivePools}
          />
          Display inactive pools
        </label>
      </div>

      <div className="flex flex-col md:flex-row gap-2 w-full">
        {visiblePools.map((pool) => (
          <PoolCard
            key={pool.index}
            name={pool.name}
            tvlUsd={pool.tvlUsd}
            apr={pool.apr}
            isActive={pool.isActive}
          />
        ))}
      </div>
    </Block>
  );
}