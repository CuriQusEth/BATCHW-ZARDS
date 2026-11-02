import React, { useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { useDenimMonitor } from '../lib/denim';
import { Zap, Activity, Info, ChevronDown, Check, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function DenimStatus() {
  const { chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const { blockNumber, isDenimLive, observedBlockIntervalMs } = useDenimMonitor();
  const [showDetails, setShowDetails] = useState(false);

  const currentChainName = chainId === baseSepolia.id ? 'Base Sepolia' : chainId === base.id ? 'Base Mainnet' : 'Other Network';

  return (
    <div className="relative font-mono text-xs">
      <div className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800/90 border border-purple-500/30 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg shadow-purple-950/40 transition-colors">
        {/* Pulse Heartbeat */}
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDenimLive ? 'bg-cyan-400' : 'bg-amber-400'}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isDenimLive ? 'bg-cyan-500' : 'bg-amber-500'}`}></span>
        </span>

        {/* Denim Badge */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1.5 text-left text-white/90 hover:text-white"
        >
          <Zap size={13} className={isDenimLive ? 'text-cyan-400 animate-pulse' : 'text-amber-400'} />
          <span className="font-bold tracking-tight text-[11px]">
            {isDenimLive ? 'DENIM 200ms' : 'BASE DENIM'}
          </span>
          <span className="text-white/40 text-[10px]">|</span>
          <span className="text-[10px] text-purple-200/80 font-mono">
            #{blockNumber ? blockNumber.toString() : '...'}
          </span>
          <ChevronDown size={12} className={`text-white/50 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown modal with Denim details & chain switcher */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-72 bg-slate-950/95 border border-purple-500/30 rounded-xl p-4 shadow-2xl backdrop-blur-xl z-50 text-left font-sans text-xs"
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-cyan-400" />
                <span className="font-bold text-white text-[12px] tracking-wide">Base Denim Network</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${isDenimLive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                {isDenimLive ? '200ms LIVE' : 'PREPARING'}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
              Base Denim replaces legacy Flashblocks with <span className="text-cyan-300 font-semibold">canonical 200ms native blocks</span> (5 blocks/sec) with no pending state tag required.
            </p>

            <div className="space-y-1.5 mb-3 bg-white/5 p-2.5 rounded-lg border border-white/5 font-mono text-[10px]">
              <div className="flex justify-between text-slate-400">
                <span>Block Cadence:</span>
                <span className="text-cyan-300 font-bold">~200 ms</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Current Height:</span>
                <span className="text-white">{blockNumber ? blockNumber.toString() : 'Syncing...'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>State Resolution:</span>
                <span className="text-emerald-400 font-bold">Canonical Only</span>
              </div>
            </div>

            {/* Network switcher */}
            {isConnected && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-[10px] text-purple-300/70 uppercase tracking-widest font-bold block mb-2">Switch Network</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => switchChain?.({ chainId: baseSepolia.id })}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-between transition-all ${chainId === baseSepolia.id ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/5'}`}
                  >
                    <span>Base Sepolia</span>
                    {chainId === baseSepolia.id && <Check size={12} className="text-cyan-400" />}
                  </button>
                  <button
                    onClick={() => switchChain?.({ chainId: base.id })}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-between transition-all ${chainId === base.id ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/5'}`}
                  >
                    <span>Base Mainnet</span>
                    {chainId === base.id && <Check size={12} className="text-amber-400" />}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
