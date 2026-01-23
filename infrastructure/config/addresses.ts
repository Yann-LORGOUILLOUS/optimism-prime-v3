export const OPTIMISM_ADDRESSES = {
  reliquaryV1: "0xb6372b2b157fb80703c985c19a41f76dcbbd4b71" as const,
  reliquaryV2: "0x74755891c6383aAE7eDB073E835b89d7C4d815bA" as const,
  autobribesV1: "0x5a863113ac76000faedaaf6a0abf02c21130e3e3" as const,
  autobribesV2: "0xdf62bEbBcA74f3d9E491B80698bCABc298AE4f64" as const,
  opp: "0x676f784d19c7f1ac6c6beaeaac78b02a73427852" as const,
  velodromeOppEthV1: "0x9e0fed4f8284b5b81601b4c7fa50f68dbf958a86" as const,
  velodromeOppEthV2: "0x62191c893df8d26ac295ba1274a00975dc07190c" as const,
};

export const BALANCER_ADDRESSES = {
  optimismVault: "0xba12222222228d8ba445958a75a0704d566bf2c8" as const,
};

export const FANTOM_ADDRESSES = {
  reliquaryV1: null,
  reliquaryV2: null,
  autobribesV1: null,
  autobribesV2: null,
};

export const POLYGON_ADDRESSES = {
  reliquaryV1: null,
  reliquaryV2: null,
  autobribesV1: null,
  autobribesV2: null,
};

type ChainAddresses = {
  reliquaryV1: `0x${string}` | null;
  reliquaryV2: `0x${string}` | null;
  autobribesV1: `0x${string}` | null;
  autobribesV2: `0x${string}` | null;
};

export const RELIQUARY_ADDRESSES: Record<number, ChainAddresses> = {
  10: {
    reliquaryV1: OPTIMISM_ADDRESSES.reliquaryV1,
    reliquaryV2: OPTIMISM_ADDRESSES.reliquaryV2,
    autobribesV1: OPTIMISM_ADDRESSES.autobribesV1,
    autobribesV2: OPTIMISM_ADDRESSES.autobribesV2,
  },
  250: {
    reliquaryV1: FANTOM_ADDRESSES.reliquaryV1,
    reliquaryV2: FANTOM_ADDRESSES.reliquaryV2,
    autobribesV1: FANTOM_ADDRESSES.autobribesV1,
    autobribesV2: FANTOM_ADDRESSES.autobribesV2,
  },
  137: {
    reliquaryV1: POLYGON_ADDRESSES.reliquaryV1,
    reliquaryV2: POLYGON_ADDRESSES.reliquaryV2,
    autobribesV1: POLYGON_ADDRESSES.autobribesV1,
    autobribesV2: POLYGON_ADDRESSES.autobribesV2,
  },
};

export type ContractType = "reliquary" | "autobribes";

export function getContractAddress(
  chainId: number,
  contractType: ContractType,
  version: 1 | 2
): `0x${string}` | null {
  const addresses = RELIQUARY_ADDRESSES[chainId];
  if (!addresses) return null;

  if (contractType === "reliquary") {
    return version === 1 ? addresses.reliquaryV1 : addresses.reliquaryV2;
  }
  return version === 1 ? addresses.autobribesV1 : addresses.autobribesV2;
}