import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDailyMission } from '../data/missions';

const STORE_KEY = 'milosbusyday_v1';

interface MiloState {
  totalStars:       number;
  focusStars:       number;
  helperStars:      number;
  routineStars:     number;
  completedSteps:   string[];
  interactedObjects:string[];
  currentRoom:      string;
  currentMissionId: string;
  unlockedItems:    string[];
  lastPlayed:       string | null;
  streak:           number;

  // Actions
  tapObject:        (objId: string, isMission: boolean, helperStars: number, missionStep?: string) => void;
  setRoom:          (room: string) => void;
  completeStep:     (stepId: string) => void;
  addStars:         (type: 'focus'|'helper'|'routine', count: number) => void;
  unlockItem:       (id: string) => void;
  loadState:        () => Promise<void>;
  saveState:        () => Promise<void>;
  resetDay:         () => void;
}

export const useMilosBusyDayStore = create<MiloState>((set, get) => ({
  totalStars:        0,
  focusStars:        0,
  helperStars:       0,
  routineStars:      0,
  completedSteps:    [],
  interactedObjects: [],
  currentRoom:       'bedroom',
  currentMissionId:  getDailyMission().id,
  unlockedItems:     [],
  lastPlayed:        null,
  streak:            0,

  tapObject: (objId, isMission, helperStars, missionStep) => {
    const { interactedObjects } = get();
    if (interactedObjects.includes(objId)) return;
    const newInteracted = [...interactedObjects, objId];
    const bonus = helperStars > 0 ? helperStars : 0;
    set(s => ({
      interactedObjects: newInteracted,
      totalStars:  s.totalStars  + bonus,
      helperStars: s.helperStars + bonus,
    }));
    get().saveState();
  },

  setRoom: (room) => set({ currentRoom: room }),

  completeStep: (stepId) => {
    const { completedSteps } = get();
    if (completedSteps.includes(stepId)) return;
    const newSteps = [...completedSteps, stepId];
    set(s => ({
      completedSteps: newSteps,
      totalStars:    s.totalStars    + 5,
      routineStars:  s.routineStars  + 5,
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
  },

  unlockItem: (id) => set(s => ({ unlockedItems: [...s.unlockedItems, id] })),

  loadState: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      const today = new Date().toDateString();
      const isNewDay = s.lastPlayed !== today;
      set({
        totalStars:        s.totalStars        ?? 0,
        focusStars:        s.focusStars        ?? 0,
        helperStars:       s.helperStars       ?? 0,
        routineStars:      s.routineStars      ?? 0,
        completedSteps:    isNewDay ? [] : (s.completedSteps ?? []),
        interactedObjects: isNewDay ? [] : (s.interactedObjects ?? []),
        currentRoom:       'bedroom',
        unlockedItems:     s.unlockedItems     ?? [],
        streak:            isNewDay ? (s.streak ?? 0) + 1 : (s.streak ?? 0),
        lastPlayed:        s.lastPlayed,
        currentMissionId:  getDailyMission().id,
      });
    } catch (e) { console.warn('Failed to load MBD state:', e); }
  },

  saveState: async () => {
    const s = get();
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
    }));
  },

  resetDay: () => set({
    completedSteps: [], interactedObjects: [],
    currentRoom: 'bedroom', currentMissionId: getDailyMission().id,
  }),
}));
