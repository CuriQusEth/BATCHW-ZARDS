import { useState, useEffect, useRef } from 'react';
import { useBlockNumber, useChainId } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

/**
 * Base Denim Upgrade Configuration
 * 
 * - Denim replaces Flashblocks with canonical 200ms native blocks.
 * - Flashblocks subscriptions (eth_subscribe("newFlashblocks"), pendingLogs) and "pending"
 *   block tags are replaced by canonical queries and standard "newHeads" / "logs".
 * - Denim activated on Base Sepolia on October 21, 2026 at 18:00 UTC.
 * - Denim targeting Base Mainnet in November 2026.
 */
export const DENIM_CONFIG = {
  blockTimeMs: 200,
  supportedChains: [
    {
      id: baseSepolia.id,
      name: 'Base Sepolia',
      denimStatus: 'Active (200ms Native Blocks)',
      activatedAt: 'Oct 21, 2026',
      isLive: true,
    },
    {
      id: base.id,
      name: 'Base Mainnet',
      denimStatus: 'Denim Ready (Targeting Nov 2026)',
      activatedAt: 'Targeting Nov 2026',
      isLive: false,
    },
  ],
  migrationSummary: {
    flashblocksReplaced: true,
    canonical200msBlocks: true,
    pendingTagDeprecated: true,
    recommendedSubscription: 'eth_subscribe("newHeads")',
  },
} as const;

/**
 * Real-time hook for Denim 200ms block monitoring.
 * Replaces any Flashblocks or "pending" state polling with canonical 250ms polling.
 */
export function useDenimMonitor() {
  const chainId = useChainId();
  const isDenimLive = chainId === baseSepolia.id;
  const isBaseNetwork = chainId === base.id || chainId === baseSepolia.id;

  // Poll canonical blocks at 250ms cadence (matching 200ms Denim block generation)
  const { data: blockNumber, isLoading } = useBlockNumber({
    watch: true,
    query: {
      refetchInterval: 250,
    },
    scopeKey: `denim-canonical-blocks-${chainId}`,
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
    chainId,
    isDenimLive,
    isBaseNetwork,
    targetBlockTimeMs: DENIM_CONFIG.blockTimeMs,
    observedBlockIntervalMs: recentIntervalMs,
    statusText: isDenimLive ? 'Denim Active (200ms)' : 'Base Mainnet (Denim Ready)',
  };
}
