import { create } from 'zustand';

export type GameState = 'MENU' | 'PLAYING' | 'GAMEOVER';

export type ElementType = 'FIRE' | 'ICE' | 'LIGHTNING' | 'NATURE';

interface GameStore {
  gameState: GameState;
  score: number;
  health: number;
  maxHealth: number;
  batchQueue: ElementType[];
  wizardSkin: string;
  setGameState: (state: GameState) => void;
  setScore: (score: number | ((prev: number) => number)) => void;
  setHealth: (health: number | ((prev: number) => number)) => void;
  resetGame: () => void;
  addToBatch: (element: ElementType) => void;
  castBatch: () => ElementType[];
  clearBatch: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'MENU',
  score: 0,
  health: 100,
  maxHealth: 100,
  batchQueue: [],
  wizardSkin: 'default',
  setGameState: (state) => set({ gameState: state }),
  setScore: (score) => set((state) => ({ score: typeof score === 'function' ? score(state.score) : score })),
  setHealth: (health) => set((state) => ({ health: typeof health === 'function' ? health(state.health) : health })),
  resetGame: () => set({ score: 0, health: 100, gameState: 'PLAYING', batchQueue: [] }),
  addToBatch: (element) => set((state) => {
    if (state.batchQueue.length >= 4) return state;
    return { batchQueue: [...state.batchQueue, element] };
  }),
  castBatch: () => {
    let casted: ElementType[] = [];
    set((state) => {
      casted = [...state.batchQueue];
      return { batchQueue: [] };
    });
    return casted;
  },
  clearBatch: () => set({ batchQueue: [] }),
}));
