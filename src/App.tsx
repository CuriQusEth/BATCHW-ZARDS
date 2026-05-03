import React from 'react';
import { useGameStore } from './store/gameStore';
import { GameCanvas } from './game/GameCanvas';
import { MainMenu } from './components/MainMenu';
import { HUD } from './components/HUD';
import { GameOver } from './components/GameOver';
import { Web3Provider } from './lib/Web3Provider';

export default function App() {
  const gameState = useGameStore((state) => state.gameState);

  return (
    <Web3Provider>
      <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans select-none touching-none flex">
        <GameCanvas />
        
        {gameState === 'MENU' && <MainMenu />}
        {gameState === 'PLAYING' && <HUD />}
        {gameState === 'GAMEOVER' && <GameOver />}
        
      </div>
    </Web3Provider>
  );
}
