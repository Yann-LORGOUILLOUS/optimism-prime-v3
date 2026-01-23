import { defineChain } from "viem";

export const optimism = defineChain({
  id: 10,
  name: "Optimism",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.optimism.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Optimism Explorer",
      url: "https://optimistic.etherscan.io",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 4286263,
    },
  },
});

export const fantom = defineChain({
  id: 250,
  name: "Fantom",
  nativeCurrency: {
    name: "Fantom",
    symbol: "FTM",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.ftm.tools"],
    },
  },
  blockExplorers: {
    default: {
      name: "FTMScan",
      url: "https://ftmscan.com",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 33001987,
    },
  },
});

export const polygon = defineChain({
  id: 137,
  name: "Polygon",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://polygon-rpc.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "PolygonScan",
      url: "https://polygonscan.com",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 25770160,
    },
  },
});

export const supportedChains = [optimism, fantom, polygon] as const;

export const defaultChain = optimism;