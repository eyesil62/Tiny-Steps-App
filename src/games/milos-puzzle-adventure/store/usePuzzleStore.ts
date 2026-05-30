import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORE_KEY = 'milospuzzle_v1';

interface PuzzleState {
  completedPuzzles: string[];
  totalStars:       number;
  unlockedStickers: string[];
  unlockedToys:     string[];
  worldProgress:    Record<string, string[]>;
  mysteryBoxesOpened: number[];

  completePuzzle: (puzzleId: string, stickerId: string, toyId: string, world: string) => void;
  openMysteryBox: (level: number) => void;
  loadState:      () => Promise<void>;
  saveState:      () => Promise<void>;
}

export const usePuzzleStore = create<PuzzleState>((set, get) => ({
  completedPuzzles:   [],
  totalStars:         0,
  unlockedStickers:   [],
  unlockedToys:       [],
  worldProgress:      {},
  mysteryBoxesOpened: [],

  completePuzzle: (puzzleId, stickerId, toyId, world) => {
    const { completedPuzzles, unlockedStickers, unlockedToys, totalStars, worldProgress } = get();
    if (completedPuzzles.includes(puzzleId)) return;
    const newCompleted = [...completedPuzzles, puzzleId];
    const worldItems   = worldProgress[world] ?? [];
    set({
      completedPuzzles: newCompleted,
      unlockedStickers: unlockedStickers.includes(stickerId) ? unlockedStickers : [...unlockedStickers, stickerId],
      unlockedToys:     unlockedToys.includes(toyId) ? unlockedToys : [...unlockedToys, toyId],
      totalStars:       totalStars + 10,
      worldProgress:    { ...worldProgress, [world]: [...worldItems, puzzleId] },
    });
    get().saveState();
  },

  openMysteryBox: (level) => {
    const { mysteryBoxesOpened, totalStars } = get();
    if (mysteryBoxesOpened.includes(level)) return;
    set({ mysteryBoxesOpened: [...mysteryBoxesOpened, level], totalStars: totalStars + 15 });
    get().saveState();
  },

  loadState: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      set({
        completedPuzzles:   s.completedPuzzles   ?? [],
        totalStars:         s.totalStars         ?? 0,
        unlockedStickers:   s.unlockedStickers   ?? [],
        unlockedToys:       s.unlockedToys       ?? [],
        worldProgress:      s.worldProgress      ?? {},
        mysteryBoxesOpened: s.mysteryBoxesOpened ?? [],
      });
    } catch {}
  },

  saveState: async () => {
    const s = get();
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify({
      completedPuzzles:   s.completedPuzzles,
      totalStars:         s.totalStars,
      unlockedStickers:   s.unlockedStickers,
      unlockedToys:       s.unlockedToys,
      worldProgress:      s.worldProgress,
      mysteryBoxesOpened: s.mysteryBoxesOpened,
    }));
  },
}));
