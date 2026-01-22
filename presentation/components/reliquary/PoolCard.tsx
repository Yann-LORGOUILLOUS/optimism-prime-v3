import { APR } from "../../../domain/reliquary/value-objects/APR";

interface PoolCardProps {
  name: string;
  tvlUsd: number;
  apr: APR;
  isActive: boolean;
}

export function PoolCard({ name, tvlUsd, apr, isActive }: PoolCardProps) {
  if (!isActive) {
    return null;
  }

  return (
    <div className="bg-gray-800 p-3 w-full text-center">
      <p className="bg-blue-800 py-1 font-bold">{name}</p>
      <p className="mt-2">TVL: ${tvlUsd.toFixed(2)}</p>
      <p>
        APR: {apr.displayWithSymbol()} {apr.isHighYield() && "🔥"}
      </p>
    </div>
  );
}