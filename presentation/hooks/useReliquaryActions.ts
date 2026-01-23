"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { RELIQUARY_ABI } from "@/infrastructure/blockchain/abis/reliquaryAbi";
import { ERC20_ABI } from "@/infrastructure/blockchain/abis/erc20Abi";
import { optimism } from "@/infrastructure/config/chains";

export function useCreateRelicAndDeposit() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createRelicAndDeposit = (
    reliquaryAddress: `0x${string}`,
    toAddress: `0x${string}`,
    poolId: number,
    amount: bigint
  ) => {
    writeContract({
      address: reliquaryAddress,
      abi: RELIQUARY_ABI,
      functionName: "createRelicAndDeposit",
      args: [toAddress, BigInt(poolId), amount],
      chainId: optimism.id,
    });
  };

  return {
    createRelicAndDeposit,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useDeposit() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const deposit = (
    reliquaryAddress: `0x${string}`,
    amount: bigint,
    relicId: number
  ) => {
    writeContract({
      address: reliquaryAddress,
      abi: RELIQUARY_ABI,
      functionName: "deposit",
      args: [amount, BigInt(relicId)],
      chainId: optimism.id,
    });
  };

  return {
    deposit,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useWithdraw() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdraw = (
    reliquaryAddress: `0x${string}`,
    amount: bigint,
    relicId: number
  ) => {
    writeContract({
      address: reliquaryAddress,
      abi: RELIQUARY_ABI,
      functionName: "withdraw",
      args: [amount, BigInt(relicId)],
      chainId: optimism.id,
    });
  };

  return {
    withdraw,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useHarvest() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const harvest = (
    reliquaryAddress: `0x${string}`,
    relicId: number,
    toAddress: `0x${string}`
  ) => {
    writeContract({
      address: reliquaryAddress,
      abi: RELIQUARY_ABI,
      functionName: "harvest",
      args: [BigInt(relicId), toAddress],
      chainId: optimism.id,
    });
  };

  return {
    harvest,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useUpdatePosition() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const updatePosition = (
    reliquaryAddress: `0x${string}`,
    relicId: number
  ) => {
    writeContract({
      address: reliquaryAddress,
      abi: RELIQUARY_ABI,
      functionName: "updatePosition",
      args: [BigInt(relicId)],
      chainId: optimism.id,
    });
  };

  return {
    updatePosition,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useApprove() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = (
    tokenAddress: `0x${string}`,
    spenderAddress: `0x${string}`,
    amount: bigint
  ) => {
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spenderAddress, amount],
      chainId: optimism.id,
    });
  };

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
