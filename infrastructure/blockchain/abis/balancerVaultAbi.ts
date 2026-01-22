export const BALANCER_VAULT_ABI = [
  {
    type: 'function',
    name: 'getPoolTokenInfo',
    stateMutability: 'view',
    inputs: [
      { name: 'poolId', type: 'bytes32' },
      { name: 'token', type: 'address' },
    ],
    outputs: [
      { name: 'cash', type: 'uint256' },
      { name: 'managed', type: 'uint256' },
      { name: 'lastChangeBlock', type: 'uint256' },
      { name: 'assetManager', type: 'address' },
    ],
  },
] as const;
