import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion } from 'motion/react';
import { useERC8021Transaction } from '../lib/erc8021';
import { parseEther } from 'viem';
import { useAccount, useSignMessage, usePublicClient } from 'wagmi';
import { createSiweMessage, generateSiweNonce } from 'viem/siwe';

export function GameOver() {
  const { score, resetGame } = useGameStore();
  const { address, chainId, isConnected } = useAccount();
  const { sendAttributedTransaction, isPending } = useERC8021Transaction();
  const [submitted, setSubmitted] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const { signMessageAsync } = useSignMessage();
  const publicClient = usePublicClient();

  const handleSubmitScore = async () => {
    if (!address || !chainId || !publicClient) return;
    
    try {
      setIsSigning(true);
      // Construct a SIWE message embedding the score as a statement
      // and asking user to sign to verify it's them.
      const nonce = generateSiweNonce();
      const message = createSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        nonce,
        statement: `I am submitting my high score of ${score} to Batch Wizard.`,
        uri: window.location.origin,
        version: '1',
      });

      const signature = await signMessageAsync({ account: address, message });
      const valid = await publicClient.verifySiweMessage({ message, signature });
      
      if (!valid) throw new Error("SIWE signature invalid");

      setIsSigning(false);

      // Submit actual transaction to chain
      const tx = await sendAttributedTransaction({
        to: '0x0000000000000000000000000000000000000000', // Mock score contract
        value: parseEther('0'),
      });
      console.log("Score submitted TX:", tx);
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      setIsSigning(false);
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
          <>
            <button 
              onClick={handleSubmitScore}
              disabled={isPending || isSigning || submitted || score === 0}
              className={`w-full py-4 text-xs tracking-widest uppercase font-bold rounded-xl shadow-lg transition-all mb-4 border border-transparent
                ${submitted ? 'bg-green-500/20 text-green-400 border-green-500/30 cursor-not-allowed' : 
                  (isPending || isSigning) ? 'bg-white/5 text-white/50 border-white/10 cursor-wait' : 
                  'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-600/40 hover:scale-105 active:scale-95 border-white/10'}`}
            >
              {submitted ? 'RUN RECORDED (200ms BLOCK)' : isSigning ? 'SIGNING...' : isPending ? 'TRANSACTING...' : 'RECORD THIS BATCH RUN ON-CHAIN'}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[9px] text-cyan-300/80 mb-4 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Sub-second settlement powered by Base Denim</span>
            </div>
          </>
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
