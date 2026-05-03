import React from 'react';
import { useGameStore, ElementType } from '../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function MainMenu() {
  const { setGameState } = useGameStore();
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#070714]/80 backdrop-blur-xl z-50 p-6"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)] mb-6"
      >
        <span className="text-5xl border-white/10">🧙</span>
      </motion.div>
      <motion.h1 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-5xl font-black tracking-tight text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] text-center"
      >
        BATCH WIZARD
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[10px] text-purple-300/60 uppercase tracking-widest font-semibold mb-12 text-center"
      >
        ERC-8021 Attribution Enabled
      </motion.p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button 
          onClick={() => setGameState('PLAYING')}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-black text-lg tracking-[0.2em] shadow-xl shadow-purple-600/40 hover:scale-105 active:scale-95 text-white transition-all border border-white/10"
        >
          START SURVIVAL
        </button>

        <div className="bg-white/5 p-5 rounded-3xl border border-white/10 mt-4 flex flex-col items-center shadow-lg backdrop-blur-sm">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-4">Onchain Profile</h2>
          {isConnected ? (
            <div className="w-full flex flex-col gap-3">
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full flex items-center justify-center gap-2 w-full">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs font-mono text-gray-300 truncate">{address}</span>
              </div>
              <button 
                 onClick={() => disconnect()}
                 className="w-full py-2 text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white rounded-xl transition border border-white/10"
               >
                 Disconnect
               </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  className="w-full py-3 text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white rounded-xl transition border border-white/10"
                >
                  Connect {connector.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-center mt-4">
           <div className="inline-block bg-black/40 px-3 py-1 rounded border border-white/5">
              <p className="text-[8px] font-mono text-gray-500 uppercase">TX CODE: bc_iikhcsnm</p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
