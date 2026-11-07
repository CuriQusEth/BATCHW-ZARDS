import React from 'react';
import { useGameStore } from './store/gameStore';
import { GameCanvas } from './game/GameCanvas';
import { MainMenu } from './components/MainMenu';
import { HUD } from './components/HUD';
import { GameOver } from './components/GameOver';
import { Web3Provider } from './lib/Web3Provider';
import { useAccount } from 'wagmi';
import { useERC8021Transaction } from './lib/erc8021';
import { parseEther, encodeFunctionData } from 'viem';
import { Sun } from 'lucide-react';

import { DenimStatus } from './components/DenimStatus';

function GameContent() {
  const gameState = useGameStore((state) => state.gameState);
  const { isConnected } = useAccount();
  const { sendAttributedTransaction, isPending } = useERC8021Transaction();

  const sendGMTransaction = async () => {
    try {
      const gmData = encodeFunctionData({
        abi: [{ name: 'gm', type: 'function', inputs: [], outputs: [], stateMutability: 'nonpayable' }],
        functionName: 'gm'
      });
      
      await sendAttributedTransaction({
        to: '0xcD0dd3716C5561De47a24949335dF8a8CD8F71a3',
        value: parseEther('0'),
        data: gmData
      });
      alert('GM sent on-chain via Base Mainnet Denim (200ms)!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans select-none touching-none flex">
      <GameCanvas />
      
      {gameState === 'MENU' && <MainMenu />}
      {gameState === 'PLAYING' && <HUD />}
      {gameState === 'GAMEOVER' && <GameOver />}
      
      {/* Top Bar with Denim Monitor & GM Button */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <DenimStatus />
        {isConnected && (
          <button
            onClick={sendGMTransaction}
            disabled={isPending}
            className="px-3 py-2 rounded-lg bg-[#E8A020]/20 hover:bg-[#E8A020]/30 border border-[#E8A020]/40 text-[#E8A020] transition-colors flex items-center gap-2 font-['Cinzel'] text-xs font-bold"
          >
            <Sun size={16} />
            {isPending ? 'SAYING GM...' : 'Say GM'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <GameContent />
    </Web3Provider>
  );
}
