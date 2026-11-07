import React, { useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { useDenimMonitor } from '../lib/denim';
import { Zap, ChevronDown, Check, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function DenimStatus() {
  const { chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const { blockNumber, isDenimLive, isMainnet } = useDenimMonitor();
  const [showDetails, setShowDetails] = useState(false);

  const activeChainId = chainId || base.id;
  const isBaseMainnet = activeChainId === base.id;

  return (
    <div className="relative font-mono text-xs">
      <div className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-500/40 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg shadow-cyan-950/40 transition-colors">
        {/* Pulse Heartbeat */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-cyan-400"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>

        {/* Denim Badge */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1.5 text-left text-white/90 hover:text-white"
        >
          <Zap size={13} className="text-cyan-400 animate-pulse" />
          <span className="font-bold tracking-tight text-[11px] text-cyan-200">
            {isBaseMainnet ? 'DENIM MAINNET' : 'DENIM SEPOLIA'}
          </span>
          <span className="text-white/40 text-[10px]">|</span>
          <span className="text-[10px] text-cyan-300 font-mono font-semibold">
            200ms #{blockNumber ? blockNumber.toString() : '...'}
          </span>
          <ChevronDown size={12} className={`text-white/50 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown modal with Denim Mainnet details & chain switcher */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-72 bg-slate-950/95 border border-cyan-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-xl z-50 text-left font-sans text-xs"
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-cyan-400" />
                <span className="font-bold text-white text-[12px] tracking-wide">Base Denim Network</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {isBaseMainnet ? 'MAINNET 200ms' : 'SEPOLIA 200ms'}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
              Denim activated on <span className="text-cyan-300 font-semibold">Base Mainnet (Nov 5, 2026)</span>. Flashblocks & pending state retired; full canonical blocks are produced every 200ms (5 blocks/sec).
            </p>

            <div className="space-y-1.5 mb-3 bg-white/5 p-2.5 rounded-lg border border-white/5 font-mono text-[10px]">
              <div className="flex justify-between text-slate-400">
                <span>Active Network:</span>
                <span className="text-cyan-300 font-bold">{isBaseMainnet ? 'Base Mainnet (8453)' : 'Base Sepolia (84532)'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Block Cadence:</span>
                <span className="text-cyan-300 font-bold">200 ms native</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Current Canonical Head:</span>
                <span className="text-white">#{blockNumber ? blockNumber.toString() : 'Syncing...'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>State Consistency:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck size={11} /> 100% Canonical
                </span>
              </div>
            </div>

            {/* Network switcher */}
            {isConnected && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-[10px] text-purple-300/70 uppercase tracking-widest font-bold block mb-2">Selected Network</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => switchChain?.({ chainId: base.id })}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-between transition-all ${activeChainId === base.id ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/5'}`}
                  >
                    <span>Base Mainnet</span>
                    {activeChainId === base.id && <Check size={12} className="text-cyan-400" />}
                  </button>
                  <button
                    onClick={() => switchChain?.({ chainId: baseSepolia.id })}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-between transition-all ${activeChainId === baseSepolia.id ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/5'}`}
                  >
                    <span>Base Sepolia</span>
                    {activeChainId === baseSepolia.id && <Check size={12} className="text-cyan-400" />}
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
