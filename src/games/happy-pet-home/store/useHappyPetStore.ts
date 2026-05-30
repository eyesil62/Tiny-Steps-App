// ============================================================
// Happy Pet Home — Zustand Store with AsyncStorage persistence
// ============================================================
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PetId } from '../data/pets';
import { PetNeeds, DEFAULT_NEEDS, decayNeeds } from '../utils/petNeeds';
import { getDayKey, isNewDay, calculateStreak, getHoursElapsed } from '../utils/dailyRewards';

const STORAGE_KEY = 'happypet_v1';

export type GameScreen = 'select' | 'name' | 'room' | 'feed' | 'bath' | 'play' | 'sleep' | 'decor';

interface HappyPetState {
  // Pet identity
  petId:        PetId | null;
  petName:      string;
  isAdopted:    boolean;

  // Needs
  needs:        PetNeeds;

  // Progress
  stars:        number;
  level:        number;
  streak:       number;
  lastPlayed:   string | null;
  todayActions: string[];

  // Unlocked
  unlockedItems:  string[];
  roomLayout:     Record<string, { x: number; y: number }>;

  // UI
  currentScreen:  GameScreen;
  showGreeting:   boolean;
  greetingText:   string;

  // Actions
  adoptPet:       (id: PetId) => void;
  namePet:        (name: string) => void;
  setScreen:      (screen: GameScreen) => void;
  feedPet:        (foodId: string, hungerBoost: number) => void;
  washPet:        () => void;
  playWithPet:    (happyBoost: number) => void;
  sleepPet:       () => void;
  addStars:       (n: number) => void;
  dismissGreeting:() => void;
  loadSavedState: () => Promise<void>;
  saveState:      () => Promise<void>;
  resetGame:      () => void;
}

export const useHappyPetStore = create<HappyPetState>((set, get) => ({
  petId:         null,
  petName:       '',
  isAdopted:     false,
  needs:         DEFAULT_NEEDS,
  stars:         0,
  level:         1,
  streak:        0,
  lastPlayed:    null,
  todayActions:  [],
  unlockedItems: ['bed', 'food-bowl', 'bathtub', 'toy-basket', 'window', 'rug'],
  roomLayout:    {},
  currentScreen: 'select',
  showGreeting:  false,
  greetingText:  '',

  adoptPet: (id) => {
    set({ petId: id, currentScreen: 'name' });
    get().saveState();
  },

  namePet: (name) => {
    set({
      petName:      name || get().petId ?? 'Buddy',
      isAdopted:    true,
      currentScreen:'room',
      showGreeting: true,
      greetingText: `Welcome home, ${name || 'little one'}! 🏠`,
    });
    get().saveState();
  },

  setScreen: (screen) => set({ currentScreen: screen }),

  feedPet: (foodId, hungerBoost) => {
    const { needs, todayActions, stars } = get();
    const newHunger = Math.min(100, needs.hunger + hungerBoost);
    const newHappy  = Math.min(100, needs.happiness + 5);
    const starsEarned = 2;
    const newActions = todayActions.includes('feed') ? todayActions : [...todayActions, 'feed'];
    set({
      needs:       { ...needs, hunger: newHunger, happiness: newHappy },
      stars:       stars + starsEarned,
      todayActions:newActions,
    });
    get().saveState();
  },

  washPet: () => {
    const { needs, todayActions, stars } = get();
    const newActions = todayActions.includes('wash') ? todayActions : [...todayActions, 'wash'];
    set({
      needs:       { ...needs, cleanliness: 100, happiness: Math.min(100, needs.happiness + 10) },
      stars:       stars + 3,
      todayActions:newActions,
    });
    get().saveState();
  },

  playWithPet: (happyBoost) => {
    const { needs, todayActions, stars } = get();
    const newActions = todayActions.includes('play') ? todayActions : [...todayActions, 'play'];
    set({
      needs:       {
        ...needs,
        happiness: Math.min(100, needs.happiness + happyBoost),
        energy:    Math.max(0, needs.energy - 10),
        hunger:    Math.max(0, needs.hunger  - 5),
      },
      stars:       stars + 2,
      todayActions:newActions,
    });
    get().saveState();
  },

  sleepPet: () => {
    const { needs, todayActions, stars } = get();
    const newActions = todayActions.includes('sleep') ? todayActions : [...todayActions, 'sleep'];
    set({
      needs:       { ...needs, energy: 100, happiness: Math.min(100, needs.happiness + 5) },
      stars:       stars + 2,
      todayActions:newActions,
    });
    get().saveState();
  },

  addStars: (n) => {
    set(s => ({ stars: s.stars + n }));
    get().saveState();
  },

  dismissGreeting: () => set({ showGreeting: false }),

  loadSavedState: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);

      // Apply time-based decay
      const hours  = getHoursElapsed(saved.lastPlayed);
      const decayed = decayNeeds(saved.needs ?? DEFAULT_NEEDS, hours);

      // Calculate streak
      const newStreak = calculateStreak(saved.lastPlayed, saved.streak ?? 0);
      const returning = isNewDay(saved.lastPlayed);

      const petName = saved.petName ?? '';
      const greeting = returning && saved.isAdopted
        ? `${petName} missed you so much! 💕`
        : `Welcome back, ${petName || 'friend'}! 🌟`;

      set({
        ...saved,
        needs:        decayed,
        streak:       newStreak,
        todayActions: returning ? [] : (saved.todayActions ?? []),
        showGreeting: returning && saved.isAdopted,
        greetingText: greeting,
        currentScreen:saved.isAdopted ? 'room' : 'select',
      });
    } catch (e) {
      console.warn('Failed to load pet state:', e);
    }
  },

  saveState: async () => {
    try {
      const state = get();
      const toSave = {
        petId:        state.petId,
        petName:      state.petName,
        isAdopted:    state.isAdopted,
        needs:        state.needs,
        stars:        state.stars,
        level:        state.level,
        streak:       state.streak,
        lastPlayed:   getDayKey(),
        todayActions: state.todayActions,
        unlockedItems:state.unlockedItems,
        roomLayout:   state.roomLayout,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save pet state:', e);
    }
  },

  resetGame: () => {
    AsyncStorage.removeItem(STORAGE_KEY);
    set({
      petId: null, petName: '', isAdopted: false,
      needs: DEFAULT_NEEDS, stars: 0, level: 1, streak: 0,
      lastPlayed: null, todayActions: [],
      unlockedItems: ['bed','food-bowl','bathtub','toy-basket','window','rug'],
      roomLayout: {}, currentScreen: 'select', showGreeting: false,
    });
  },
}));
