const OPP_ETH_PAIR_ADDRESS = "0x62191c893df8d26ac295ba1274a00975dc07190c";
const OP_USDC_PAIR_ADDRESS = "0x47029bc8f5cbe3b464004e87ef9c9419a48018cd";
const DEXSCREENER_API_BASE = "https://api.dexscreener.com/latest/dex/pairs/optimism";

export type TokenPriceData = {
  priceUsd: number;
  volume24h: number;
  marketCap: number;
};

export type PairData = {
  priceUsd: number;
  liquidityUsd: number;
};

type DexScreenerPair = {
  priceUsd?: string | number;
  volume?: { h24?: string | number };
  fdv?: string | number;
  liquidity?: { usd?: string | number };
};

type DexScreenerResponse = {
  pair?: DexScreenerPair;
  pairs?: DexScreenerPair[];
};

const CACHE_TTL_MS = 60_000;
const pairCache = new Map<string, { ts: number; pair: DexScreenerPair }>();
const inflight = new Map<string, Promise<DexScreenerPair | null>>();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRateLimited(response: Response) {
  return response.status === 429;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function parseDexScreenerResponse(value: unknown): DexScreenerResponse {
  if (!isRecord(value)) return {};
  
  const pair = value["pair"];
  if (pair && isRecord(pair)) return { pair: pair as DexScreenerPair };
  
  const pairs = value["pairs"];
  if (Array.isArray(pairs) && pairs.length > 0) {
    return { pair: pairs[0] as DexScreenerPair };
  }
  
  return {};
}

async function fetchPair(pairAddress: string): Promise<DexScreenerPair | null> {
  const now = Date.now();

  const cached = pairCache.get(pairAddress);
  if (cached && now - cached.ts < CACHE_TTL_MS) {
    return cached.pair;
  }

  const existing = inflight.get(pairAddress);
  if (existing) return existing;

  const promise = (async () => {
    const url = `${DEXSCREENER_API_BASE}/${pairAddress}`;

    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const response = await fetch(url);

        if (response.ok) {
          const raw: unknown = await response.json();
          const data = parseDexScreenerResponse(raw);
          if (data.pair) {
            pairCache.set(pairAddress, { ts: Date.now(), pair: data.pair });
            return data.pair;
          }
          return null;
        }

        if (isRateLimited(response) || response.status >= 500) {
          const backoff = 400 * Math.pow(2, attempt);
          await sleep(backoff);
          continue;
        }

        return null;
      } catch {
        const backoff = 400 * Math.pow(2, attempt);
        await sleep(backoff);
      }
    }

    return null;
  })();

  inflight.set(pairAddress, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(pairAddress);
  }
}

export async function fetchOppPrice(): Promise<TokenPriceData> {
  const pair = await fetchPair(OPP_ETH_PAIR_ADDRESS);
  
  if (!pair) {
    const cached = pairCache.get(OPP_ETH_PAIR_ADDRESS);
    const fallbackPair = cached?.pair;

    return {
      priceUsd: toNumber(fallbackPair?.priceUsd, 0),
      volume24h: toNumber(fallbackPair?.volume?.h24, 0),
      marketCap: toNumber(fallbackPair?.fdv, 0),
    };
  }

  return {
    priceUsd: toNumber(pair.priceUsd, 0),
    volume24h: toNumber(pair.volume?.h24, 0),
    marketCap: toNumber(pair.fdv, 0),
  };
}

export async function fetchOpPrice(): Promise<TokenPriceData> {
  const pair = await fetchPair(OP_USDC_PAIR_ADDRESS);

  if (!pair) {
    return { priceUsd: 1.5, volume24h: 0, marketCap: 0 };
  }

  return {
    priceUsd: toNumber(pair.priceUsd, 1.5),
    volume24h: toNumber(pair.volume?.h24, 0),
    marketCap: toNumber(pair.fdv, 0),
  };
}

export async function fetchTokenPrice(pairAddress: string): Promise<number> {
  const pair = await fetchPair(pairAddress);
  if (!pair) return 0;
  return toNumber(pair.priceUsd, 0);
}

export async function fetchPairData(pairAddress: string): Promise<PairData> {
  const pair = await fetchPair(pairAddress);
  if (!pair) return { priceUsd: 0, liquidityUsd: 0 };

  return {
    priceUsd: toNumber(pair.priceUsd, 0),
    liquidityUsd: toNumber(pair.liquidity?.usd, 0),
  };
}