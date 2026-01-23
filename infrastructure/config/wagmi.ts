import { createConfig, http } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { optimism, fantom, polygon } from './chains';

const fantomWithIcon = {
  ...fantom,
  iconUrl: 'https://cryptologos.cc/logos/fantom-ftm-logo.png',
};

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const connectors = [
  injected(),
  ...(walletConnectProjectId
    ? [walletConnect({ projectId: walletConnectProjectId })]
    : []),
];

if (!walletConnectProjectId) {
  // Important : en prod ça évite de “planter” pour un simple manque de config.
  console.warn('[wagmi] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is missing: WalletConnect disabled.');
}

export const config = createConfig({
  chains: [optimism, fantomWithIcon, polygon],
  transports: {
    [optimism.id]: http(),
    [fantom.id]: http(),
    [polygon.id]: http(),
  },
  connectors,
});
