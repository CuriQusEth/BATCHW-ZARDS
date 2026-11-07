import { useState, useEffect, useRef } from 'react';
import { useBlockNumber, useChainId } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

/**
 * Base Denim Upgrade Configuration
 * 
 * - Denim replaces Flashblocks with canonical 200ms native blocks (5 blocks/second).
 * - Denim activated on Base Sepolia on October 21, 2026 at 18:00 UTC.
 * - Denim activated on Base Mainnet on November 5, 2026 at 18:00 UTC.
 * - Flashblocks subscriptions, WebSocket streams, and pending state are retired on both networks.
 * - All queries use canonical latest state via standard eth_subscribe("newHeads") / "logs".
 */
export const DENIM_CONFIG = {
  blockTimeMs: 200,
  defaultChainId: base.id,
  supportedChains: [
    {
      id: base.id,
      name: 'Base Mainnet',
      denimStatus: 'Active (200ms Native Blocks)',
      activatedAt: 'Nov 5, 2026 at 18:00 UTC',
      isLive: true,
      isPrimary: true,
    },
    {
      id: baseSepolia.id,
      name: 'Base Sepolia',
      denimStatus: 'Active (200ms Native Blocks)',
      activatedAt: 'Oct 21, 2026 at 18:00 UTC',
      isLive: true,
      isPrimary: false,
    },
  ],
  migrationSummary: {
    flashblocksReplaced: true,
    canonical200msBlocks: true,
    pendingTagDeprecated: true,
    mainnetActivated: true,
    mainnetActivationDate: '2026-11-05T18:00:00Z',
    recommendedSubscription: 'eth_subscribe("newHeads")',
  },
} as const;

/**
 * Real-time hook for Denim 200ms block monitoring on Base Mainnet & Base Sepolia.
 * Replaces any Flashblocks or "pending" state polling with canonical 250ms polling.
 */
export function useDenimMonitor() {
  const chainId = useChainId();
  // Denim is active on both Base Mainnet and Base Sepolia!
  const isDenimLive = chainId === base.id || chainId === baseSepolia.id || !chainId;
  const isMainnet = chainId === base.id || !chainId;
  const isBaseNetwork = chainId === base.id || chainId === baseSepolia.id;

  // Poll canonical blocks at 250ms cadence (matching 200ms Denim block generation on Base Mainnet)
  const { data: blockNumber, isLoading } = useBlockNumber({
    watch: true,
    query: {
      refetchInterval: 250,
    },
    scopeKey: `denim-canonical-blocks-${chainId || base.id}`,
  });

  const [lastBlockTime, setLastBlockTime] = useState<number>(Date.now());
  const [recentIntervalMs, setRecentIntervalMs] = useState<number>(200);
  const prevBlockRef = useRef<bigint | null>(null);

  useEffect(() => {
    if (blockNumber && prevBlockRef.current !== null && blockNumber !== prevBlockRef.current) {
      const now = Date.now();
      const diff = now - lastBlockTime;
      setRecentIntervalMs(diff > 0 && diff < 5000 ? diff : 200);
      setLastBlockTime(now);
    }
    prevBlockRef.current = blockNumber ?? null;
  }, [blockNumber]);

  return {
    blockNumber,
    isLoading,
    chainId: chainId || base.id,
    isDenimLive,
    isMainnet,
    isBaseNetwork,
    targetBlockTimeMs: DENIM_CONFIG.blockTimeMs,
    observedBlockIntervalMs: recentIntervalMs,
    statusText: isMainnet 
      ? 'Base Mainnet Denim Active (200ms)' 
      : 'Base Sepolia Denim Active (200ms)',
  };
}
