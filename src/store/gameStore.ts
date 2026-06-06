import { create } from 'zustand';

export type GameState = 'MENU' | 'PLAYING' | 'GAMEOVER';

export type ElementType = 'FIRE' | 'WATER' | 'EARTH' | 'WIND';

interface GameStore {
  gameState: GameState;
  score: number;
  health: number;
  maxHealth: number;
  combo: number;
  batchGrid: (ElementType | null)[];
  wizardSkin: string;
  setGameState: (state: GameState) => void;
  setScore: (score: number | ((prev: number) => number)) => void;
  setHealth: (health: number | ((prev: number) => number)) => void;
  setCombo: (combo: number | ((prev: number) => number)) => void;
  resetGame: () => void;
  setGridSlot: (index: number, element: ElementType | null) => void;
  castBatch: () => ElementType[];
  clearBatch: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'MENU',
  score: 0,
  health: 100,
  maxHealth: 100,
  combo: 0,
  batchGrid: Array(9).fill(null),
  wizardSkin: 'default',
  setGameState: (state) => set({ gameState: state }),
  setScore: (score) => set((state) => ({ score: typeof score === 'function' ? score(state.score) : score })),
  setHealth: (health) => set((state) => ({ health: typeof health === 'function' ? health(state.health) : health })),
  setCombo: (combo) => set((state) => ({ combo: typeof combo === 'function' ? combo(state.combo) : combo })),
  resetGame: () => set({ score: 0, health: 100, combo: 0, gameState: 'PLAYING', batchGrid: Array(9).fill(null) }),
  setGridSlot: (index, element) => set((state) => {
    const newGrid = [...state.batchGrid];
    // Check max elements (up to 4)
    const currentCount = newGrid.filter(e => e !== null).length;
    if (element !== null && currentCount >= 4 && newGrid[index] === null) return state; // Block if already 4 and adding new
    newGrid[index] = element;
    return { batchGrid: newGrid };
  }),
  castBatch: () => {
    let casted: ElementType[] = [];
    set((state) => {
      casted = state.batchGrid.filter((e): e is ElementType => e !== null);
      if (casted.length > 0) {
        return { batchGrid: Array(9).fill(null), combo: state.combo + 1 };
      }
      return state;
    });
    return casted;
  },
  clearBatch: () => set({ batchGrid: Array(9).fill(null) }),
}));
