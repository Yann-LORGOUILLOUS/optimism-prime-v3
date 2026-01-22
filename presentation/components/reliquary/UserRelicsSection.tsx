"use client";

import { Block } from "../common/Block";
import { Button } from "../common/Button";
import { TokenAmount } from "../../../domain/reliquary/value-objects/TokenAmount";

interface PoolDeposit {
  poolIndex: number;
  poolName: string;
  depositUsd: number;
}

interface UserRelicsSectionProps {
  totalValueUsd: number;
  totalPendingRewards: TokenAmount;
  totalPendingRewardsUsd: number;
  rewardSymbol: string;
  poolDeposits: PoolDeposit[];
  showInactivePools: boolean;
  onCreateRelic: () => void;
}

export function UserRelicsSection({
  totalValueUsd,
  totalPendingRewards,
  totalPendingRewardsUsd,
  rewardSymbol,
  poolDeposits,
  showInactivePools,
  onCreateRelic,
}: UserRelicsSectionProps) {
  const visibleDeposits = showInactivePools
    ? poolDeposits
    : poolDeposits.filter((deposit) => deposit.depositUsd > 0);

  return (
    <Block>
      <h2 className="text-3xl font-transformers">Your Prime Relics</h2>

      <div className="flex flex-col items-center gap-1 w-full">
        <p>Total Value: ${totalValueUsd.toFixed(2)}</p>
        <p>
          Total Pending Rewards: {totalPendingRewards.formatted()}{" "}
          {rewardSymbol} (${totalPendingRewardsUsd.toFixed(2)})
        </p>

        <div className="flex flex-col md:flex-row gap-2 w-full mt-2">
          {visibleDeposits.map((deposit) => (
            <div
              key={deposit.poolIndex}
              className="bg-gray-800 p-2 w-full text-center"
            >
              <p className="bg-blue-800 py-1">{deposit.poolName}</p>
              <p>${deposit.depositUsd.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={onCreateRelic} className="w-full md:w-auto">
        Create Relic
      </Button>
    </Block>
  );
}