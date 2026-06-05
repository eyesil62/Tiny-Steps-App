// ============================================================
// Milo's Busy Day — Zustand Store
// ============================================================
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDailyMission } from '../data/missions';

const STORE_KEY = 'milosbusyday_v2';

interface MiloState {
  // Star counts
  totalStars:        number;
  focusStars:        number;
  helperStars:       number;
  routineStars:      number;

  // Progress tracking
  completedSteps:    string[]; // step IDs completed this session
  interactedObjects: string[]; // object IDs tapped this session

  // Navigation
  currentRoom:       string;
  currentMissionId:  string;

  // Owned items
  unlockedItems:     string[];

  // Persistence
  lastPlayed:        string | null;
  streak:            number;

  // Mission badges & sticker book
  completedMissions: string[];  // mission IDs ever completed
  earnedStickers:    string[];  // badge emojis earned

  // Daily chest
  lastChestDate:     string | null;

  // ── Actions ──────────────────────────────────────────────
  tapObject:          (objId: string, helperStars: number) => void;
  setRoom:            (room: string) => void;
  completeStep:       (stepId: string) => void;
  addStars:           (type: 'focus' | 'helper' | 'routine', count: number) => void;
  spendStars:         (amount: number) => void;
  unlockItem:         (id: string) => void;
  addCompletedMission:(missionId: string, badgeEmoji: string) => void;
  claimDailyChest:    () => void;
  loadState:          () => Promise<void>;
  saveState:          () => Promise<void>;
  resetDay:           () => void;
}

export const useMilosBusyDayStore = create<MiloState>((set, get) => ({
  totalStars:         0,
  focusStars:         0,
  helperStars:        0,
  routineStars:       0,
  completedSteps:     [],
  interactedObjects:  [],
  currentRoom:        'bedroom',
  currentMissionId:   getDailyMission().id,
  unlockedItems:      [],
  lastPlayed:         null,
  streak:             0,
  completedMissions:  [],
  earnedStickers:     [],
  lastChestDate:      null,

  tapObject: (objId, helperStarsAmount) => {
    const { interactedObjects } = get();
    if (interactedObjects.includes(objId)) return;
    const bonus = helperStarsAmount > 0 ? helperStarsAmount : 0;
    set(s => ({
      interactedObjects: [...s.interactedObjects, objId],
      totalStars:        s.totalStars  + bonus,
      helperStars:       s.helperStars + bonus,
    }));
    get().saveState();
  },

  setRoom: (room) => set({ currentRoom: room }),

  completeStep: (stepId) => {
    const { completedSteps } = get();
    if (completedSteps.includes(stepId)) return;
    set(s => ({
      completedSteps: [...s.completedSteps, stepId],
      totalStars:     s.totalStars    + 5,
      routineStars:   s.routineStars  + 5,
    }));
    get().saveState();
  },

  addStars: (type, count) => {
    set(s => ({
      totalStars:   s.totalStars + count,
      focusStars:   type === 'focus'   ? s.focusStars   + count : s.focusStars,
      helperStars:  type === 'helper'  ? s.helperStars  + count : s.helperStars,
      routineStars: type === 'routine' ? s.routineStars + count : s.routineStars,
    }));
    get().saveState();
  },

  spendStars: (amount) => {
    set(s => ({ totalStars: Math.max(0, s.totalStars - amount) }));
    get().saveState();
  },

  unlockItem: (id) => {
    set(s => ({ unlockedItems: [...s.unlockedItems, id] }));
    get().saveState();
  },

  addCompletedMission: (missionId, badgeEmoji) => {
    const { completedMissions, earnedStickers } = get();
    if (completedMissions.includes(missionId)) return;
    set({
      completedMissions: [...completedMissions, missionId],
      earnedStickers:    earnedStickers.includes(badgeEmoji)
        ? earnedStickers
        : [...earnedStickers, badgeEmoji],
    });
    get().saveState();
  },

  claimDailyChest: () => {
    const today = new Date().toDateString();
    set(s => ({
      totalStars:    s.totalStars + 8,
      routineStars:  s.routineStars + 8,
      lastChestDate: today,
    }));
    get().saveState();
  },

  loadState: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      const today = new Date().toDateString();
      const isNewDay = s.lastPlayed !== today;
      set({
        totalStars:         s.totalStars         ?? 0,
        focusStars:         s.focusStars         ?? 0,
        helperStars:        s.helperStars        ?? 0,
        routineStars:       s.routineStars       ?? 0,
        completedSteps:     isNewDay ? [] : (s.completedSteps     ?? []),
        interactedObjects:  isNewDay ? [] : (s.interactedObjects  ?? []),
        currentRoom:        'bedroom',
        unlockedItems:      s.unlockedItems      ?? [],
        streak:             isNewDay ? (s.streak ?? 0) + 1 : (s.streak ?? 0),
        lastPlayed:         s.lastPlayed         ?? null,
        currentMissionId:   getDailyMission().id,
        completedMissions:  s.completedMissions  ?? [],
        earnedStickers:     s.earnedStickers     ?? [],
        lastChestDate:      s.lastChestDate      ?? null,
      });
    } catch (e) {
      console.warn('Failed to load MBD state:', e);
    }
  },

  saveState: async () => {
    const s = get();
    try {
      await AsyncStorage.setItem(STORE_KEY, JSON.stringify({
        totalStars:        s.totalStars,
        focusStars:        s.focusStars,
        helperStars:       s.helperStars,
        routineStars:      s.routineStars,
        completedSteps:    s.completedSteps,
        interactedObjects: s.interactedObjects,
        unlockedItems:     s.unlockedItems,
        streak:            s.streak,
        lastPlayed:        new Date().toDateString(),
        completedMissions: s.completedMissions,
        earnedStickers:    s.earnedStickers,
        lastChestDate:     s.lastChestDate,
      }));
    } catch (e) {
      console.warn('Failed to save MBD state:', e);
    }
  },

  resetDay: () => set({
    completedSteps:    [],
    interactedObjects: [],
    currentRoom:       'bedroom',
    currentMissionId:  getDailyMission().id,
  }),
}));
