import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http, WagmiProvider as WagmiConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { ReactNode, useState } from 'react';

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  );
}
