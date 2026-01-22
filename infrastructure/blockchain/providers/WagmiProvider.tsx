"use client";

import { ReactNode } from "react";
import { WagmiProvider as WagmiProviderBase, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { optimism, fantom, polygon } from "../../config/chains";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
  appName: "Optimism Prime",
  projectId: "f35fde9923cfde6a98bc79961fcf756a",
  chains: [optimism, fantom, polygon],
  ssr: true,
  transports: {
    [optimism.id]: http("https://optimism.drpc.org"),
    [fantom.id]: http("https://rpc.ankr.com/fantom"),
    [polygon.id]: http("https://rpc.ankr.com/polygon"),
  },
});

const queryClient = new QueryClient();

interface Props {
  children: ReactNode;
}

export function WagmiProvider({ children }: Props) {
  return (
    <WagmiProviderBase config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#ef4444",
            accentColorForeground: "#ffffff",
          })}
        >
          {children}
        </RainbowKitProvider>

      </QueryClientProvider>
    </WagmiProviderBase>
  );
}