export const EXTERNAL_URLS = {
  medium: {
    reliquaryPrime: "https://medium.com/optimism-prime/introducing-the-reliquary-prime-12d648212a07",
    autobribes: "https://medium.com/optimism-prime/introducing-autobribes-8fed520b9b60",
  },
  twitter: "https://twitter.com/OptimismPrime_",
  etherscan: {
    opToken: "https://optimistic.etherscan.io/token/0x4200000000000000000000000000000000000042",
  },
} as const;

export const DISCLAIMER_CONFIG = {
  earn: {
    storageKey: "opp_earn-warning-acknowledged",
    timestampKey: "opp_earn-warning-acknowledged-timestamp",
  },
  autobribes: {
    storageKey: "opp_autobribes-warning-acknowledged",
    timestampKey: "opp_autobribes-warning-acknowledged-timestamp",
  },
} as const;

export const FEATURED_POOLS = {
  earn: "Soundwave",
  autobribes: "OP/VELO",
} as const;

export const UI_LIMITS = {
  defaultVisibleRelics: 3,
  maxRelicsToLoad: 150,
} as const;
