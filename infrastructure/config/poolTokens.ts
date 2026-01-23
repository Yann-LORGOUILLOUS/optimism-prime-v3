export type PoolTokenConfig = {
  displayName: string;
  shortName: string;
  url: string;
  poolId?: `0x${string}`;
};

export const POOL_TOKEN_CONFIG: Record<string, PoolTokenConfig> = {
  "0x676f784d19c7F1Ac6C6BeaeaaC78B02a73427852": {
    displayName: "Optimism Prime $OPP",
    shortName: "OPP",
    url: "https://velodrome.finance/swap?from=eth&to=0x676f784d19c7f1ac6c6beaeaac78b02a73427852",
  },
  "0xbC886d0E4a9a86b26799706577Cae1cE8Ba62522": {
    displayName: "Tarot Borrowable $OPP",
    shortName: "Tarot OPP",
    url: "https://www.tarot.to/lending-pool/10/0x31ab35018a205d434c31fda7fc6cfab5d58e4ff9",
  },
  "0x9E0FeD4F8284B5b81601B4C7Fa50f68DBf958A86": {
    displayName: "Velodrome OPP/ETH V1",
    shortName: "OPP/ETH",
    url: "https://v1.velodrome.finance/liquidity/manage?address=0x9e0fed4f8284b5b81601b4c7fa50f68dbf958a86",
  },
  "0x87BDF9BA91F353777Fb1Fe7cF4b7DFeCF80d714E": {
    displayName: "Velodrome OPP/fBOMB V1",
    shortName: "OPP/fBOMB",
    url: "https://v1.velodrome.finance/liquidity/manage?address=0x87bdf9ba91f353777fb1fe7cf4b7dfecf80d714e",
  },
  "0xaB004E185954e84Bd7BB176BF21eA09897118DdB": {
    displayName: "Velodrome OPP/OP V1",
    shortName: "OPP/OP",
    url: "https://v1.velodrome.finance/liquidity/manage?address=0xab004e185954e84bd7bb176bf21ea09897118ddb",
  },
  "0x62191C893DF8d26aC295BA1274a00975dc07190C": {
    displayName: "Velodrome OPP/ETH V2",
    shortName: "OPP/ETH",
    url: "https://velodrome.finance/deposit?token0=0x676f784d19c7f1ac6c6beaeaac78b02a73427852&token1=eth&type=-1",
  },
  "0x4Ec77c33bD56d2151ACE9f28F6cA27601410e858": {
    displayName: "Velodrome OPP/fBOMB V2",
    shortName: "OPP/fBOMB 💥",
    url: "https://velodrome.finance/deposit?token0=0x676f784d19c7f1ac6c6beaeaac78b02a73427852&token1=0x74ccbe53f77b08632ce0cb91d3a545bf6b8e0979&type=-1",
  },
  "0x30dB561826b820299F0BEF9B8bd8946127b9D89A": {
    displayName: "Velodrome OPP/OP V2",
    shortName: "OPP/OP",
    url: "https://velodrome.finance/deposit?token0=0x676f784d19c7f1ac6c6beaeaac78b02a73427852&token1=0x4200000000000000000000000000000000000042&type=-1",
  },
  "0xAE6c9B2A2777D0396cbE7E13Fc9ACEAC0D052e00": {
    displayName: "Velodrome OPP/opxVELO",
    shortName: "OPP/opxVELO",
    url: "https://velodrome.finance/deposit?token0=0x676f784d19c7f1ac6c6beaeaac78b02a73427852&token1=0xc38464250f51123078bbd7ea574e185f6623d037&type=-1",
  },
  "0x1711BE555D2cDE5fe60142DF0F635d16FB5265BD": {
    displayName: "Velodrome OPP/2192",
    shortName: "OPP/2192 ⚔️",
    url: "https://velodrome.finance/deposit?token0=0x676f784d19c7f1ac6c6beaeaac78b02a73427852&token1=0x3ed9acaac7bd974eb83a8ea6432a239e3c829d5d&type=-1",
  },
  "0xadF86a03AF1C77D81380f9fa7c4c797a3ebf2d3A": {
    displayName: "BeethovenX Optimism Prime Soundwave",
    shortName: "OPP Soundwave 🎵",
    url: "https://op.beets.fi/pool/0xadf86a03af1c77d81380f9fa7c4c797a3ebf2d3a000100000000000000000146",
    poolId: "0xadf86a03af1c77d81380f9fa7c4c797a3ebf2d3a000100000000000000000146",
  },
  "0xe9581d0F1A628B038fC8B2a7F5A7d904f0e2f937": {
    displayName: "Velodrome OP/VELO",
    shortName: "OP/VELO",
    url: "https://velodrome.finance/deposit?token0=0x4200000000000000000000000000000000000042&token1=0x9560e827af36c94d2ac33a39bce1fe78631088db&stable=false",
  },
  "0x6387765fFA609aB9A1dA1B16C455548Bfed7CbEA": {
    displayName: "Velodrome WETH/LUSD",
    shortName: "WETH/LUSD",
    url: "https://velodrome.finance/deposit?token0=0x4200000000000000000000000000000000000006&token1=0xc40f949f8a4e094d1b49a23ea9241d289b7b2819&stable=false",
  },
  "0x3B375bA61920551217f5944F4F5d8a63989A438e": {
    displayName: "Velodrome sUSD/LUSD",
    shortName: "sUSD/LUSD",
    url: "https://velodrome.finance/deposit?token0=0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9&token1=0xc40f949f8a4e094d1b49a23ea9241d289b7b2819&stable=true",
  },
  "0xdc2B136A9C1FD2a0b9497bB8b11823c2FBf47Ac4": {
    displayName: "Velodrome ETH/GRAIN",
    shortName: "ETH/GRAIN",
    url: "https://velodrome.finance/deposit?token0=0x4200000000000000000000000000000000000006&token1=0xfd389dc9533717239856190f42475d3f263a270d&stable=false",
  },
  "0x79c912FEF520be002c2B6e57EC4324e260f38E50": {
    displayName: "Velodrome ETH/USDC V1",
    shortName: "ETH/USDC",
    url: "https://v1.velodrome.finance/liquidity/manage?address=0x79c912fef520be002c2b6e57ec4324e260f38e50",
  },
  "0xFFD74EF185989BFF8752c818A53a47FC45388F08": {
    displayName: "Velodrome OP/VELO V1",
    shortName: "OP/VELO",
    url: "https://v1.velodrome.finance/liquidity/manage?address=0xffd74ef185989bff8752c818a53a47fc45388f08",
  },
  "0x91e0fC1E4D32cC62C4f9Bc11aCa5f3a159483d31": {
    displayName: "Velodrome WETH/LUSD V1",
    shortName: "WETH/LUSD",
    url: "https://v1.velodrome.finance/liquidity/manage?address=0x91e0fc1e4d32cc62c4f9bc11aca5f3a159483d31",
  },
  "0x0D693eFd716021878D5979FaB4Cf8f6c1b7ce450": {
    displayName: "Velodrome sUSD/LUSD V1",
    shortName: "sUSD/LUSD",
    url: "https://v1.velodrome.finance/liquidity/manage?address=0x0d693efd716021878d5979fab4cf8f6c1b7ce450",
  },
};

export function getPoolTokenConfig(tokenAddress: string): PoolTokenConfig | undefined {
  const normalizedAddress = Object.keys(POOL_TOKEN_CONFIG).find(
    (key) => key.toLowerCase() === tokenAddress.toLowerCase()
  );
  return normalizedAddress ? POOL_TOKEN_CONFIG[normalizedAddress] : undefined;
}

export function isKnownPoolToken(tokenAddress: string): boolean {
  return getPoolTokenConfig(tokenAddress) !== undefined;
}