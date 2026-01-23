import { PublicClient } from "viem";
import { RELIQUARY_ABI } from "@/infrastructure/blockchain/abis/reliquaryAbi";
import { ERC20_ABI } from "@/infrastructure/blockchain/abis/erc20Abi";
import { EMISSION_CURVE_ABI } from "@/infrastructure/blockchain/abis/emissionCurveAbi";
import { BALANCER_VAULT_ABI } from "@/infrastructure/blockchain/abis/balancerVaultAbi";
import { getPoolTokenConfig, POOL_TOKEN_CONFIG } from "@/infrastructure/config/poolTokens";
import { fetchOpPrice, fetchOppPrice, fetchPairData } from "@/infrastructure/pricing/DexScreenerAdapter";
import { BALANCER_ADDRESSES, OPTIMISM_ADDRESSES, getContractAddress, ContractType } from "@/infrastructure/config/addresses";

const OP_TOKEN_ADDRESS = "0x4200000000000000000000000000000000000042";
const WETH_TOKEN_ADDRESS = "0x4200000000000000000000000000000000000006";
const VELODROME_OP_USDC_PAIR = "0x47029bc8f5cbe3b464004e87ef9c9419a48018cd";
const VELODROME_WETH_USDC_PAIR_V1 = "0x79c912fef520be002c2b6e57ec4324e260f38e50";

export type LevelData = {
  requiredMaturity: number;
  multiplier: number;
  balance: bigint;
};

export type PoolData = {
  index: number;
  token: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenPriceUsd: number;
  allocPoint: number;
  totalBalance: bigint;
  levels: LevelData[];
  displayName: string;
  shortName: string;
  url: string;
  name: string;
};

export type RelicData = {
  id: number;
  poolId: number;
  amount: bigint;
  entry: number;
  level: number;
  pendingReward: bigint;
  levelOnUpdate: number;
};

export type ReliquaryData = {
  address: `0x${string}`;
  rewardToken: {
    address: `0x${string}`;
    name: string;
    symbol: string;
    decimals: number;
    balance: bigint;
  };
  emissionRate: bigint;
  totalAllocPoint: number;
  pools: PoolData[];
  oppPriceUsd: number;
  rewardTokenPriceUsd: number;
};

export type UserReliquaryData = {
  relics: RelicData[];
  tokenBalances: Record<string, bigint>;
  tokenAllowances: Record<string, bigint>;
};

const EXCHANGE_RATE_ABI = [
  {
    type: "function",
    name: "exchangeRate",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

type MulticallContracts = Parameters<PublicClient["multicall"]>[0]["contracts"];

function asContracts<T>(contracts: T): MulticallContracts {
  return contracts as unknown as MulticallContracts;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBigintArray(value: unknown): value is readonly bigint[] {
  return Array.isArray(value) && value.every((x) => typeof x === "bigint");
}

function pickBigint(value: unknown, fallback: bigint = BigInt(0)): bigint {
  return typeof value === "bigint" ? value : fallback;
}

function pickNumberFromBigint(value: unknown, fallback = 0): number {
  if (typeof value === "bigint") {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  return fallback;
}

type LevelInfo = {
  requiredMaturities: readonly bigint[];
  multipliers: readonly bigint[];
  balance: readonly bigint[];
};

function isLevelInfo(value: unknown): value is LevelInfo {
  if (!isRecord(value)) return false;
  return isBigintArray(value.requiredMaturities) && isBigintArray(value.multipliers) && isBigintArray(value.balance);
}

type Position = {
  poolId: bigint;
  amount: bigint;
  entry: bigint;
  level: bigint;
};

function isPosition(value: unknown): value is Position {
  if (!isRecord(value)) return false;
  return (
    typeof value.poolId === "bigint" &&
    typeof value.amount === "bigint" &&
    typeof value.entry === "bigint" &&
    typeof value.level === "bigint"
  );
}

export async function readReliquaryData(
  client: PublicClient,
  version: 1 | 2,
  contractType: ContractType = "reliquary"
): Promise<ReliquaryData> {
  const chainId = await client.getChainId();
  const reliquaryAddress = getContractAddress(chainId, contractType, version);

  if (!reliquaryAddress) {
    throw new Error(`${contractType} V${version} not available on chain ${chainId}`);
  }

  const globalDataResults = await client.multicall({
    contracts: [
      { address: reliquaryAddress, abi: RELIQUARY_ABI, functionName: "poolLength" },
      { address: reliquaryAddress, abi: RELIQUARY_ABI, functionName: "totalAllocPoint" },
      { address: reliquaryAddress, abi: RELIQUARY_ABI, functionName: "rewardToken" },
      { address: reliquaryAddress, abi: RELIQUARY_ABI, functionName: "emissionCurve" },
    ],
  });

  const poolLength = globalDataResults[0].status === "success" ? globalDataResults[0].result : BigInt(0);
  const totalAllocPoint = globalDataResults[1].status === "success" ? globalDataResults[1].result : BigInt(0);

  const rewardTokenAddress =
    globalDataResults[2].status === "success"
      ? (globalDataResults[2].result as `0x${string}`)
      : ("0x0" as `0x${string}`);

  const emissionCurveAddress =
    globalDataResults[3].status === "success"
      ? (globalDataResults[3].result as `0x${string}`)
      : ("0x0" as `0x${string}`);

  const rewardTokenResults = await client.multicall({
    contracts: [
      { address: rewardTokenAddress, abi: ERC20_ABI, functionName: "name" },
      { address: rewardTokenAddress, abi: ERC20_ABI, functionName: "symbol" },
      { address: rewardTokenAddress, abi: ERC20_ABI, functionName: "decimals" },
      { address: rewardTokenAddress, abi: ERC20_ABI, functionName: "balanceOf", args: [reliquaryAddress] },
      { address: emissionCurveAddress, abi: EMISSION_CURVE_ABI, functionName: "getRate", args: [BigInt(0)] },
    ],
  });

  const rewardName = rewardTokenResults[0].status === "success" ? (rewardTokenResults[0].result as string) : "Unknown";
  const rewardSymbol = rewardTokenResults[1].status === "success" ? (rewardTokenResults[1].result as string) : "???";
  const rewardDecimals = rewardTokenResults[2].status === "success" ? (rewardTokenResults[2].result as number) : 18;
  const rewardBalance = rewardTokenResults[3].status === "success" ? (rewardTokenResults[3].result as bigint) : BigInt(0);
  const emissionRate = rewardTokenResults[4].status === "success" ? (rewardTokenResults[4].result as bigint) : BigInt(0);

  const [oppPriceData, opPriceData] = await Promise.all([fetchOppPrice(), fetchOpPrice()]);

  const rewardTokenPriceUsd =
    rewardTokenAddress.toLowerCase() === OP_TOKEN_ADDRESS
      ? opPriceData.priceUsd
      : await resolveRewardTokenPriceUsd(chainId, rewardTokenAddress);

  const pools = await readAllPoolsWithMulticall(
    client,
    reliquaryAddress,
    Number(poolLength),
    oppPriceData.priceUsd,
    OPTIMISM_ADDRESSES.opp
  );

  return {
    address: reliquaryAddress,
    rewardToken: {
      address: rewardTokenAddress,
      name: rewardName,
      symbol: rewardSymbol,
      decimals: rewardDecimals,
      balance: rewardBalance,
    },
    emissionRate,
    totalAllocPoint: Number(totalAllocPoint),
    pools,
    oppPriceUsd: oppPriceData.priceUsd,
    rewardTokenPriceUsd,
  };
}

async function readAllPoolsWithMulticall(
  client: PublicClient,
  reliquaryAddress: `0x${string}`,
  poolCount: number,
  oppPriceUsd: number,
  oppAddress: `0x${string}`
): Promise<PoolData[]> {
  const knownTokens = Object.keys(POOL_TOKEN_CONFIG).map((addr) => addr.toLowerCase());

  const poolTokenCalls = Array.from({ length: poolCount }, (_, i) => ({
    address: reliquaryAddress,
    abi: RELIQUARY_ABI,
    functionName: "poolToken",
    args: [BigInt(i)],
  }));

  const poolTokenResults = await client.multicall({ contracts: asContracts(poolTokenCalls) });

  const validPools: { index: number; token: `0x${string}` }[] = [];
  for (let i = 0; i < poolCount; i++) {
    const result = poolTokenResults[i];
    if (result?.status === "success") {
      const token = result.result as `0x${string}`;
      const tokenLower = token.toLowerCase();
      if (knownTokens.includes(tokenLower)) {
        validPools.push({ index: i, token });
      }
    }
  }

  if (validPools.length === 0) return [];

  const poolInfoCalls = validPools.flatMap(({ index, token }) => [
    { address: reliquaryAddress, abi: RELIQUARY_ABI, functionName: "getPoolInfo", args: [BigInt(index)] },
    { address: reliquaryAddress, abi: RELIQUARY_ABI, functionName: "getLevelInfo", args: [BigInt(index)] },
    { address: token, abi: ERC20_ABI, functionName: "symbol" },
    { address: token, abi: ERC20_ABI, functionName: "decimals" },
  ]);

  const poolInfoResults = await client.multicall({ contracts: asContracts(poolInfoCalls) });

  const poolsWithoutPrice: {
    index: number;
    token: `0x${string}`;
    tokenSymbol: string;
    tokenDecimals: number;
    allocPoint: number;
    poolName: string;
    levels: LevelData[];
    totalBalance: bigint;
    tokenConfig: NonNullable<ReturnType<typeof getPoolTokenConfig>>;
  }[] = [];

  for (let i = 0; i < validPools.length; i++) {
    const { index, token } = validPools[i];
    const baseIdx = i * 4;

    const poolInfoResult = poolInfoResults[baseIdx];
    const levelInfoResult = poolInfoResults[baseIdx + 1];
    const symbolResult = poolInfoResults[baseIdx + 2];
    const decimalsResult = poolInfoResults[baseIdx + 3];

    if (poolInfoResult.status !== "success" || levelInfoResult.status !== "success") continue;

    const poolInfo: unknown = poolInfoResult.result;
    const levelInfo: unknown = levelInfoResult.result;

    if (!isLevelInfo(levelInfo)) continue;

    const tokenSymbol = symbolResult.status === "success" ? (symbolResult.result as string) : "LP";
    const tokenDecimals = decimalsResult.status === "success" ? (decimalsResult.result as number) : 18;

    const allocPoint = extractAllocPoint(poolInfo);
    const poolName = extractPoolName(poolInfo);

    const tokenConfig = getPoolTokenConfig(token);
    if (!tokenConfig) continue;

    const levels: LevelData[] = levelInfo.requiredMaturities.map((maturity, idx) => ({
      requiredMaturity: Number(maturity),
      multiplier: Number(levelInfo.multipliers[idx] ?? BigInt(0)),
      balance: levelInfo.balance[idx] ?? BigInt(0),
    }));

    const totalBalance = levels.reduce((sum, level) => sum + level.balance, BigInt(0));

    poolsWithoutPrice.push({
      index,
      token,
      tokenSymbol,
      tokenDecimals,
      allocPoint,
      poolName,
      levels,
      totalBalance,
      tokenConfig,
    });
  }

  const tokenPrices = await batchGetPoolTokenPrices(
    client,
    poolsWithoutPrice.map((p) => p.token),
    oppAddress,
    oppPriceUsd
  );

  const pools: PoolData[] = poolsWithoutPrice.map((p, i) => ({
    index: p.index,
    token: p.token,
    tokenSymbol: p.tokenSymbol,
    tokenDecimals: p.tokenDecimals,
    tokenPriceUsd: tokenPrices[i],
    allocPoint: p.allocPoint,
    totalBalance: p.totalBalance,
    levels: p.levels,
    displayName: p.tokenConfig.displayName,
    shortName: p.tokenConfig.shortName,
    url: p.tokenConfig.url,
    name: p.poolName,
  }));

  return pools;
}

async function batchGetPoolTokenPrices(
  client: PublicClient,
  tokens: `0x${string}`[],
  oppAddress: `0x${string}`,
  oppPriceUsd: number
): Promise<number[]> {
  const pricePromises = tokens.map((token) => getPoolTokenPriceUsd(client, token, oppAddress, oppPriceUsd));
  return Promise.all(pricePromises);
}

function extractAllocPoint(poolInfo: unknown): number {
  if (isRecord(poolInfo)) {
    const raw = poolInfo.allocPoint;
    return pickNumberFromBigint(raw, 0);
  }
  if (Array.isArray(poolInfo)) {
    const raw = poolInfo[2];
    return pickNumberFromBigint(raw, 0);
  }
  return 0;
}

function extractPoolName(poolInfo: unknown): string {
  if (isRecord(poolInfo)) {
    return String(poolInfo.name ?? "");
  }
  if (Array.isArray(poolInfo)) {
    return String(poolInfo[3] ?? "");
  }
  return "";
}

async function getPoolTokenPriceUsd(
  client: PublicClient,
  poolToken: `0x${string}`,
  oppAddress: `0x${string}`,
  oppPriceUsd: number
): Promise<number> {
  if (poolToken.toLowerCase() === oppAddress.toLowerCase()) {
    return oppPriceUsd;
  }

  try {
    const rate = await client.readContract({
      address: poolToken,
      abi: EXCHANGE_RATE_ABI,
      functionName: "exchangeRate",
    });

    const rateFloat = Number(rate) / 1e18;
    if (Number.isFinite(rateFloat) && rateFloat > 0 && rateFloat < 1e9) {
      return oppPriceUsd * rateFloat;
    }
  } catch {}

  const tokenConfig = getPoolTokenConfig(poolToken);
  if (tokenConfig?.poolId) {
    try {
      const results = await client.multicall({
        contracts: [
          { address: poolToken, abi: ERC20_ABI, functionName: "totalSupply" },
          {
            address: BALANCER_ADDRESSES.optimismVault,
            abi: BALANCER_VAULT_ABI,
            functionName: "getPoolTokenInfo",
            args: [tokenConfig.poolId, oppAddress],
          },
        ],
      });

      if (results[0].status === "success" && results[1].status === "success") {
        const totalSupply = results[0].result as bigint;
        const tokenInfo: unknown = results[1].result;

        const cash = Array.isArray(tokenInfo) ? pickBigint(tokenInfo[0], BigInt(0)) : BigInt(0);

        const supply = Number(totalSupply) / 1e18;
        const oppCash = Number(cash) / 1e18;

        if (supply > 0 && oppCash > 0) {
          const liquidityUsd = (oppPriceUsd * oppCash) / 0.3;
          return liquidityUsd / supply;
        }
      }
    } catch {}
  }

  try {
    const results = await client.multicall({
      contracts: [
        { address: poolToken, abi: ERC20_ABI, functionName: "totalSupply" },
        { address: oppAddress, abi: ERC20_ABI, functionName: "balanceOf", args: [poolToken] },
      ],
    });

    if (results[0].status === "success" && results[1].status === "success") {
      const totalSupply = results[0].result as bigint;
      const oppBalance = results[1].result as bigint;

      const supply = Number(totalSupply) / 1e18;
      const oppBal = Number(oppBalance) / 1e18;

      if (supply > 0 && oppBal > 0) {
        const liquidityUsd = 2 * oppPriceUsd * oppBal;
        return liquidityUsd / supply;
      }
    }
  } catch {}

  const velodromePrice = await getVelodromeLpPrice(client, poolToken);
  if (velodromePrice > 0) {
    return velodromePrice;
  }

  return 0;
}

async function getVelodromeLpPrice(client: PublicClient, lpToken: `0x${string}`): Promise<number> {
  try {
    const pairData = await fetchPairData(lpToken);

    if (pairData.liquidityUsd > 0) {
      const totalSupply = await client.readContract({
        address: lpToken,
        abi: ERC20_ABI,
        functionName: "totalSupply",
      });

      const supplyFloat = Number(totalSupply) / 1e18;
      if (supplyFloat > 0) {
        return pairData.liquidityUsd / supplyFloat;
      }
    }

    return 0;
  } catch {
    return 0;
  }
}

export async function readUserReliquaryData(
  client: PublicClient,
  reliquaryAddress: `0x${string}`,
  userAddress: `0x${string}`,
  pools: PoolData[]
): Promise<UserReliquaryData> {
  const relicBalance = await client.readContract({
    address: reliquaryAddress,
    abi: RELIQUARY_ABI,
    functionName: "balanceOf",
    args: [userAddress],
  });

  const [relics, tokenData] = await Promise.all([
    readUserRelicsWithMulticall(client, reliquaryAddress, userAddress, Number(relicBalance)),
    readUserTokenDataWithMulticall(client, reliquaryAddress, userAddress, pools),
  ]);

  return {
    relics,
    tokenBalances: tokenData.tokenBalances,
    tokenAllowances: tokenData.tokenAllowances,
  };
}

async function readUserRelicsWithMulticall(
  client: PublicClient,
  reliquaryAddress: `0x${string}`,
  userAddress: `0x${string}`,
  relicCount: number
): Promise<RelicData[]> {
  if (relicCount === 0) return [];

  const relicIdCalls = Array.from({ length: relicCount }, (_, i) => ({
    address: reliquaryAddress,
    abi: RELIQUARY_ABI,
    functionName: "tokenOfOwnerByIndex",
    args: [userAddress, BigInt(i)],
  }));

  const relicIdResults = await client.multicall({ contracts: asContracts(relicIdCalls) });

  const relicIds: bigint[] = [];
  for (const result of relicIdResults) {
    if (result.status === "success") {
      relicIds.push(result.result as bigint);
    }
  }

  if (relicIds.length === 0) return [];

  const relicDataCalls = relicIds.flatMap((relicId) => [
    { address: reliquaryAddress, abi: RELIQUARY_ABI, functionName: "getPositionForId", args: [relicId] },
    { address: reliquaryAddress, abi: RELIQUARY_ABI, functionName: "pendingReward", args: [relicId] },
    { address: reliquaryAddress, abi: RELIQUARY_ABI, functionName: "levelOnUpdate", args: [relicId] },
  ]);

  const relicDataResults = await client.multicall({ contracts: asContracts(relicDataCalls) });

  const relics: RelicData[] = [];
  for (let i = 0; i < relicIds.length; i++) {
    const baseIdx = i * 3;
    const positionResult = relicDataResults[baseIdx];
    const pendingResult = relicDataResults[baseIdx + 1];
    const levelOnUpdateResult = relicDataResults[baseIdx + 2];

    if (positionResult.status !== "success") continue;

    const position: unknown = positionResult.result;
    if (!isPosition(position)) continue;

    const pendingReward = pendingResult.status === "success" ? (pendingResult.result as bigint) : BigInt(0);
    const levelOnUpdate = levelOnUpdateResult.status === "success" ? Number(levelOnUpdateResult.result) : 0;

    relics.push({
      id: Number(relicIds[i]),
      poolId: Number(position.poolId),
      amount: position.amount,
      entry: Number(position.entry),
      level: Number(position.level),
      pendingReward,
      levelOnUpdate,
    });
  }

  return relics;
}

async function readUserTokenDataWithMulticall(
  client: PublicClient,
  reliquaryAddress: `0x${string}`,
  userAddress: `0x${string}`,
  pools: PoolData[]
): Promise<{ tokenBalances: Record<string, bigint>; tokenAllowances: Record<string, bigint> }> {
  const uniqueTokens = [...new Set(pools.map((p) => p.token as `0x${string}`))];

  if (uniqueTokens.length === 0) {
    return { tokenBalances: {}, tokenAllowances: {} };
  }

  const tokenCalls = uniqueTokens.flatMap((token) => [
    { address: token, abi: ERC20_ABI, functionName: "balanceOf", args: [userAddress] },
    { address: token, abi: ERC20_ABI, functionName: "allowance", args: [userAddress, reliquaryAddress] },
  ]);

  const results = await client.multicall({ contracts: asContracts(tokenCalls) });

  const tokenBalances: Record<string, bigint> = {};
  const tokenAllowances: Record<string, bigint> = {};

  for (let i = 0; i < uniqueTokens.length; i++) {
    const token = uniqueTokens[i];
    const balanceResult = results[i * 2];
    const allowanceResult = results[i * 2 + 1];

    tokenBalances[token] = balanceResult.status === "success" ? (balanceResult.result as bigint) : BigInt(0);
    tokenAllowances[token] = allowanceResult.status === "success" ? (allowanceResult.result as bigint) : BigInt(0);
  }

  return { tokenBalances, tokenAllowances };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function multicallWithRetry(client: PublicClient, contracts: MulticallContracts, retries: number = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await client.multicall({ contracts });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      const isRateLimited =
        message.includes("429") ||
        message.toLowerCase().includes("rate limit") ||
        message.toLowerCase().includes("too many");

      if (!isRateLimited || attempt === retries) throw e;

      await delay(300 * Math.pow(2, attempt));
    }
  }
  return await client.multicall({ contracts });
}

type ReadContractArgs = Parameters<PublicClient["readContract"]>[0];

async function readContractWithRetry<T>(
  client: PublicClient,
  args: ReadContractArgs,
  retries: number = 5
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return (await client.readContract(args)) as T;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      const isRateLimited =
        message.includes("429") ||
        message.toLowerCase().includes("rate limit") ||
        message.toLowerCase().includes("too many");

      if (!isRateLimited || attempt === retries) throw e;

      const base = 400 * Math.pow(2, attempt);
      const jitter = Math.floor(Math.random() * 200);
      await delay(base + jitter);
    }
  }

  return (await client.readContract(args)) as T;
}

export async function readAllRelics(
  client: PublicClient,
  reliquaryAddress: `0x${string}`,
  maxRelics: number = 150
): Promise<RelicData[]> {
  const totalSupply = await readContractWithRetry<bigint>(client, {
    address: reliquaryAddress,
    abi: RELIQUARY_ABI,
    functionName: "totalSupply",
  });

  const total = Number(totalSupply);
  const count = Math.min(total, maxRelics);
  if (count === 0) return [];

  const relicIdsByIndex = new Map<number, bigint>();
  const idBatchSize = 25;

  for (let start = 0; start < count; start += idBatchSize) {
    const end = Math.min(start + idBatchSize, count);

    const calls = Array.from({ length: end - start }, (_, i) => ({
      address: reliquaryAddress,
      abi: RELIQUARY_ABI,
      functionName: "tokenByIndex",
      args: [BigInt(start + i)],
    }));

    const results = await multicallWithRetry(client, asContracts(calls), 5);

    const failedIndices: number[] = [];

    for (let i = 0; i < results.length; i++) {
      const index = start + i;
      const r = results[i];

      if (r.status === "success") {
        relicIdsByIndex.set(index, r.result as bigint);
      } else {
        failedIndices.push(index);
      }
    }

    for (const index of failedIndices) {
      const relicId = await readContractWithRetry<bigint>(client, {
        address: reliquaryAddress,
        abi: RELIQUARY_ABI,
        functionName: "tokenByIndex",
        args: [BigInt(index)],
      });

      relicIdsByIndex.set(index, relicId);
      await delay(40);
    }

    await delay(120);
  }

  const relicIds: bigint[] = Array.from({ length: count }, (_, i) => relicIdsByIndex.get(i))
    .filter((v): v is bigint => typeof v === "bigint");

  if (relicIds.length === 0) return [];

  const relics: RelicData[] = [];
  const dataBatchSize = 12;

  for (let start = 0; start < relicIds.length; start += dataBatchSize) {
    const batch = relicIds.slice(start, start + dataBatchSize);

    const calls = batch.flatMap((relicId) => [
      { address: reliquaryAddress, abi: RELIQUARY_ABI, functionName: "getPositionForId", args: [relicId] },
      { address: reliquaryAddress, abi: RELIQUARY_ABI, functionName: "pendingReward", args: [relicId] },
      { address: reliquaryAddress, abi: RELIQUARY_ABI, functionName: "levelOnUpdate", args: [relicId] },
    ]);

    const results = await multicallWithRetry(client, asContracts(calls), 5);

    for (let i = 0; i < batch.length; i++) {
      const relicId = batch[i];
      const baseIdx = i * 3;

      const positionResult = results[baseIdx];
      const pendingResult = results[baseIdx + 1];
      const levelOnUpdateResult = results[baseIdx + 2];

      let position: unknown = positionResult.status === "success" ? positionResult.result : null;

      if (!isPosition(position)) {
        const positionRetry = await readContractWithRetry<unknown>(client, {
          address: reliquaryAddress,
          abi: RELIQUARY_ABI,
          functionName: "getPositionForId",
          args: [relicId],
        });

        position = positionRetry;
      }

      if (!isPosition(position)) continue;

      const pendingReward =
        pendingResult.status === "success"
          ? (pendingResult.result as bigint)
          : await readContractWithRetry<bigint>(client, {
              address: reliquaryAddress,
              abi: RELIQUARY_ABI,
              functionName: "pendingReward",
              args: [relicId],
            });

      const levelOnUpdate =
        levelOnUpdateResult.status === "success"
          ? Number(levelOnUpdateResult.result)
          : Number(
              await readContractWithRetry<bigint>(client, {
                address: reliquaryAddress,
                abi: RELIQUARY_ABI,
                functionName: "levelOnUpdate",
                args: [relicId],
              })
            );

      relics.push({
        id: Number(relicId),
        poolId: Number(position.poolId),
        amount: position.amount,
        entry: Number(position.entry),
        level: Number(position.level),
        pendingReward,
        levelOnUpdate,
      });

      await delay(15);
    }

    await delay(150);
  }

  return relics.toSorted((a, b) => b.id - a.id);
}


async function resolveRewardTokenPriceUsd(chainId: number, rewardTokenAddress: `0x${string}`): Promise<number> {
  if (chainId !== 10) return 0;

  const addr = rewardTokenAddress.toLowerCase();

  if (addr === OP_TOKEN_ADDRESS) {
    const { priceUsd } = await fetchPairData(VELODROME_OP_USDC_PAIR);
    return priceUsd;
  }

  if (addr === WETH_TOKEN_ADDRESS) {
    const { priceUsd } = await fetchPairData(VELODROME_WETH_USDC_PAIR_V1);
    return priceUsd;
  }

  return 0;
}
