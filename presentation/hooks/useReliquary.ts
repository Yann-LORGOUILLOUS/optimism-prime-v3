"use client";

import { useReadContract, useReadContracts, useAccount } from "wagmi";
import { RELIQUARY_ABI } from "@/infrastructure/blockchain/abis/reliquaryAbi";
import { ERC20_ABI } from "@/infrastructure/blockchain/abis/erc20Abi";
import { EMISSION_CURVE_ABI } from "@/infrastructure/blockchain/abis/emissionCurveAbi";
import { optimism } from "@/infrastructure/config/chains";

export function useReliquaryPoolCount(reliquaryAddress: `0x${string}`) {
  return useReadContract({
    address: reliquaryAddress,
    abi: RELIQUARY_ABI,
    functionName: "poolLength",
    chainId: optimism.id,
  });
}

export function useReliquaryTotalAllocPoint(reliquaryAddress: `0x${string}`) {
  return useReadContract({
    address: reliquaryAddress,
    abi: RELIQUARY_ABI,
    functionName: "totalAllocPoint",
    chainId: optimism.id,
  });
}

export function useReliquaryRewardToken(reliquaryAddress: `0x${string}`) {
  return useReadContract({
    address: reliquaryAddress,
    abi: RELIQUARY_ABI,
    functionName: "rewardToken",
    chainId: optimism.id,
  });
}

export function useReliquaryEmissionCurve(reliquaryAddress: `0x${string}`) {
  return useReadContract({
    address: reliquaryAddress,
    abi: RELIQUARY_ABI,
    functionName: "emissionCurve",
    chainId: optimism.id,
  });
}

export function useUserRelicBalance(reliquaryAddress: `0x${string}`) {
  const { address: userAddress } = useAccount();

  return useReadContract({
    address: reliquaryAddress,
    abi: RELIQUARY_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    chainId: optimism.id,
    query: {
      enabled: !!userAddress,
    },
  });
}

export function usePoolInfo(reliquaryAddress: `0x${string}`, poolId: number) {
  return useReadContract({
    address: reliquaryAddress,
    abi: RELIQUARY_ABI,
    functionName: "getPoolInfo",
    args: [BigInt(poolId)],
    chainId: optimism.id,
  });
}

export function usePoolToken(reliquaryAddress: `0x${string}`, poolId: number) {
  return useReadContract({
    address: reliquaryAddress,
    abi: RELIQUARY_ABI,
    functionName: "poolToken",
    args: [BigInt(poolId)],
    chainId: optimism.id,
  });
}

export function useLevelInfo(reliquaryAddress: `0x${string}`, poolId: number) {
  return useReadContract({
    address: reliquaryAddress,
    abi: RELIQUARY_ABI,
    functionName: "getLevelInfo",
    args: [BigInt(poolId)],
    chainId: optimism.id,
  });
}

export function useTokenInfo(tokenAddress: `0x${string}`) {
  const { address: userAddress } = useAccount();

  return useReadContracts({
    contracts: [
      {
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "name",
        chainId: optimism.id,
      },
      {
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "symbol",
        chainId: optimism.id,
      },
      {
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "decimals",
        chainId: optimism.id,
      },
      {
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: userAddress ? [userAddress] : undefined,
        chainId: optimism.id,
      },
    ],
    query: {
      enabled: !!userAddress,
    },
  });
}

export function useEmissionRate(emissionCurveAddress: `0x${string}`) {
  return useReadContract({
    address: emissionCurveAddress,
    abi: EMISSION_CURVE_ABI,
    functionName: "getRate",
    args: [BigInt(0)],
    chainId: optimism.id,
  });
}
