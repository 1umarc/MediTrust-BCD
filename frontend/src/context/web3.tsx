"use client";

import { wagmiAdapter, projectId } from "@/utils/web3config"; // called from web3config.ts utility
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { mainnet, arbitrum, hardhat } from "@reown/appkit/networks";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum, hardhat],
  defaultNetwork: hardhat,
  features: {
    analytics: true,
  },
});

function Web3ContextProvider({ // to call in page.tsx, context for interacting with Ethereum blockchain using wagmi
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies // cookies that will be used to initialize the WagmiProvider
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  ); // wrap children with WagmiProvider and QueryClientProvider, JSX expression
}

export default Web3ContextProvider;