import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http, WagmiProvider as WagmiConfig, createStorage, cookieStorage } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { injected, baseAccount } from 'wagmi/connectors';
import { ReactNode, useState } from 'react';

/**
 * Wagmi Client configured for Base Denim Upgrade:
 * - 200ms native block cadence
 * - Polling interval optimized to 250ms for sub-second block updates
 * - Canonical head queries (no deprecated "pending" block tags or Flashblocks)
 * - Supports Base Mainnet & Base Sepolia (Denim Live)
 */
export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected({ unstable_mipd: false } as any),
    baseAccount({
      appName: 'Batch Wizard',
    }),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(undefined, { batch: true }),
    [baseSepolia.id]: http(undefined, { batch: true }),
  },
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchInterval: 500, // Frequent refetches matching fast block times
          },
        },
      })
  );

  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  );
}
