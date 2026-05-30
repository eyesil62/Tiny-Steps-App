import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORE_KEY = 'littlechamps_v1';

export type Sport = 'soccer' | 'basketball' | 'baseball';

interface LittleChampsState {
  totalStars:     number;
  bestScores:     Record<Sport, number>;
  unlockedGear:   string[];
  selectedBall:   Record<Sport, string>;
  selectedJersey: string;
  selectedField:  string;
  dailyChallenges:{ id: string; completed: boolean }[];
  streak:         number;
  lastPlayed:     string | null;

  addScore:       (sport: Sport, score: number) => void;
  unlockGear:     (id: string) => void;
  selectBall:     (sport: Sport, id: string) => void;
  selectJersey:   (id: string) => void;
  selectField:    (id: string) => void;
  completeChallenge:(id: string) => void;
  loadState:      () => Promise<void>;
  saveState:      () => Promise<void>;
}

export const useLittleChampsStore = create<LittleChampsState>((set, get) => ({
  totalStars:      0,
  bestScores:      { soccer: 0, basketball: 0, baseball: 0 },
  unlockedGear:    ['classic-ball','classic-bball','classic-base','red-jersey','classic-goal','wood-bat'],
  selectedBall:    { soccer: 'classic-ball', basketball: 'classic-bball', baseball: 'classic-base' },
  selectedJersey:  'red-jersey',
  selectedField:   'backyard',
  dailyChallenges: [],
  streak:          0,
  lastPlayed:      null,

  addScore: (sport, score) => {
    const { bestScores, totalStars } = get();
    const stars = Math.floor(score / 20);
    const newBest = Math.max(bestScores[sport], score);
    // Unlock gear by total stars
    const newTotal = totalStars + stars;
    const { GEAR } = require('../data/gear');
    const { unlockedGear } = get();
    const newUnlocked = [...unlockedGear];
    GEAR.forEach((g: any) => {
      if (!newUnlocked.includes(g.id) && newTotal >= g.cost) newUnlocked.push(g.id);
    });
    set(s => ({
      totalStars:  newTotal,
      bestScores:  { ...s.bestScores, [sport]: newBest },
      unlockedGear: newUnlocked,
    }));
    get().saveState();
  },

  unlockGear:     (id) => set(s => ({ unlockedGear: [...s.unlockedGear, id] })),
  selectBall:     (sport, id) => set(s => ({ selectedBall: { ...s.selectedBall, [sport]: id } })),
  selectJersey:   (id) => set({ selectedJersey: id }),
  selectField:    (id) => set({ selectedField: id }),
  completeChallenge: (id) => {
    set(s => ({
      dailyChallenges: s.dailyChallenges.map(c => c.id === id ? { ...c, completed: true } : c),
      totalStars: s.totalStars + 3,
    }));
    get().saveState();
  },

  loadState: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      set({
        totalStars:     s.totalStars     ?? 0,
        bestScores:     s.bestScores     ?? { soccer: 0, basketball: 0, baseball: 0 },
        unlockedGear:   s.unlockedGear   ?? ['classic-ball','classic-bball','classic-base','red-jersey','classic-goal','wood-bat'],
        selectedBall:   s.selectedBall   ?? { soccer: 'classic-ball', basketball: 'classic-bball', baseball: 'classic-base' },
        selectedJersey: s.selectedJersey ?? 'red-jersey',
        selectedField:  s.selectedField  ?? 'backyard',
        streak:         s.streak         ?? 0,
        lastPlayed:     s.lastPlayed,
      });
    } catch {}
  },

  saveState: async () => {
    const s = get();
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify({
      totalStars: s.totalStars, bestScores: s.bestScores,
      unlockedGear: s.unlockedGear, selectedBall: s.selectedBall,
      selectedJersey: s.selectedJersey, selectedField: s.selectedField,
      streak: s.streak, lastPlayed: new Date().toDateString(),
    }));
  },
}));
