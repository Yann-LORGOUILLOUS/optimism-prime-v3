"use client";

import { useState } from "react";
import { Block } from "../common/Block";
import { Button } from "../common/Button";
import { AmountInput } from "../common/AmountInput";
import { ExternalLink } from "../common/ExternalLink";
import { MaturityTimer } from "./MaturityTimer";
import { TokenAmount } from "../../../domain/reliquary/value-objects/TokenAmount";
import { APR } from "../../../domain/reliquary/value-objects/APR";

interface RelicCardProps {
  relicId: number;
  poolName: string;
  poolUrl: string;
  amount: TokenAmount;
  pendingReward: TokenAmount;
  rewardSymbol: string;
  tvlUsd: number;
  apr: APR;
  level: number;
  maxLevel: number;
  multiplier: number;
  maturitySeconds: number;
  secondsToNextLevel: number;
  userBalance: TokenAmount;
  canClaim: boolean;
  canLevelUp: boolean;
  onClaim: () => void;
  onLevelUp: () => void;
  onDeposit: (amount: bigint) => void;
  onWithdraw: (amount: bigint) => void;
}

export function RelicCard({
  relicId,
  poolName,
  poolUrl,
  amount,
  pendingReward,
  rewardSymbol,
  tvlUsd,
  apr,
  level,
  maxLevel,
  multiplier,
  maturitySeconds,
  secondsToNextLevel,
  userBalance,
  canClaim,
  canLevelUp,
  onClaim,
  onLevelUp,
  onDeposit,
  onWithdraw,
}: RelicCardProps) {
  const [depositValue, setDepositValue] = useState("");
  const [withdrawValue, setWithdrawValue] = useState("");

  const handleDeposit = () => {
    const tokenAmount = TokenAmount.fromFormatted(depositValue, userBalance.decimals);
    onDeposit(tokenAmount.raw);
    setDepositValue("");
  };

  const handleWithdraw = () => {
    const tokenAmount = TokenAmount.fromFormatted(withdrawValue, amount.decimals);
    onWithdraw(tokenAmount.raw);
    setWithdrawValue("");
  };

  return (
    <Block>
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="flex flex-col md:w-1/3">
          <h3 className="text-3xl font-transformers">Relic #{relicId}</h3>

          <p className="mt-2">
            <span className="underline">Pool</span>:{" "}
            <ExternalLink href={poolUrl}>{poolName}</ExternalLink>
          </p>

          <p className="mt-2 underline">Pending Rewards</p>
          <p>
            {pendingReward.formatted()} {rewardSymbol}
          </p>

          <p className="mt-2 underline">Amount</p>
          <p>{amount.formatted()}</p>

          <p className="mt-2 underline">TVL</p>
          <p>${tvlUsd.toFixed(2)}</p>

          <p className="mt-2">
            <span className="underline">APR</span>: {apr.displayWithSymbol()}
          </p>

          <p className="mt-2">
            <span className="underline">Level</span>: {level} / {maxLevel}
          </p>

          <p>
            <span className="underline">Boost</span>: x{multiplier}
          </p>

          <p className="mt-2 underline">Maturity</p>
          <p>
            <MaturityTimer initialSeconds={maturitySeconds} increment={1} />
          </p>

          {secondsToNextLevel > 0 && (
            <>
              <p className="mt-2 underline">Next level in</p>
              <p>
                <MaturityTimer initialSeconds={secondsToNextLevel} increment={-1} />
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4 md:w-2/3">
          <div className="flex flex-row gap-2">
            <Button onClick={onClaim} disabled={!canClaim} className="flex-1">
              Claim
            </Button>
            <Button onClick={onLevelUp} disabled={!canLevelUp} className="flex-1">
              Level Up
            </Button>
          </div>

          <AmountInput
            value={depositValue}
            onChange={setDepositValue}
            max={userBalance.formatted(18)}
            buttonText="Deposit"
            onButtonClick={handleDeposit}
          />

          <AmountInput
            value={withdrawValue}
            onChange={setWithdrawValue}
            max={amount.formatted(18)}
            buttonText="Withdraw"
            onButtonClick={handleWithdraw}
          />
        </div>
      </div>
    </Block>
  );
}