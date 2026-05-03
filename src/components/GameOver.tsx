import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion } from 'motion/react';
import { useERC8021Transaction } from '../lib/erc8021';
import { parseEther } from 'viem';
import { useAccount } from 'wagmi';

export function GameOver() {
  const { score, resetGame } = useGameStore();
  const { isConnected } = useAccount();
  const { sendAttributedTransaction, isPending } = useERC8021Transaction();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitScore = async () => {
    try {
      // Mock contract Interaction - We just send a 0 value transaction to ourselves with the score as data
      // In a real app we'd use useERC8021BatchTransaction to call a Leaderboard contract
      // But standard sendTransaction with appended attribution code validates ERC-8021 implementation.
      
      const tx = await sendAttributedTransaction({
        to: '0x0000000000000000000000000000000000000000', // Burn address for mock score submission
        value: parseEther('0'),
      });
      console.log("Score submitted TX:", tx);
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      // Even if failed (e.g. user rejected), we just show error or ignore
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#070714]/90 backdrop-blur-2xl z-50 p-6"
    >
      <h1 className="text-6xl font-black text-white mb-4 drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]">GAME OVER</h1>
      <p className="text-[10px] text-purple-300/60 uppercase tracking-widest font-semibold mb-8 text-center max-w-sm">
        The magic has faded, but your legacy remains.
      </p>

      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center min-w-[300px] backdrop-blur-md">
        <span className="text-[10px] text-purple-300/60 uppercase tracking-widest font-bold mb-2">Final Score</span>
        <span className="text-6xl font-black text-white font-mono drop-shadow-[0_0_20px_rgba(168,85,247,0.4)] mb-8">{score.toLocaleString()}</span>

        {isConnected ? (
          <button 
            onClick={handleSubmitScore}
            disabled={isPending || submitted || score === 0}
            className={`w-full py-4 text-xs tracking-widest uppercase font-bold rounded-xl shadow-lg transition-all mb-4 border border-transparent
              ${submitted ? 'bg-green-500/20 text-green-400 border-green-500/30 cursor-not-allowed' : 
                isPending ? 'bg-white/5 text-white/50 border-white/10 cursor-wait' : 
                'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-600/40 hover:scale-105 active:scale-95 border-white/10'}`}
          >
            {submitted ? 'SCORE SUBMITTED (ONCHAIN)' : isPending ? 'TRANSACTING...' : 'SAVE SCORE ONCHAIN'}
          </button>
        ) : (
          <div className="w-full text-center p-4 bg-white/5 border border-white/10 text-white/40 rounded-xl mb-4 text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center">
            Connect wallet to save score
          </div>
        )}

        <button 
          onClick={resetGame}
          className="w-full py-4 text-sm tracking-widest uppercase font-bold bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all active:scale-95 border border-white/10"
        >
          PLAY AGAIN
        </button>
      </div>
    </motion.div>
  );
}
