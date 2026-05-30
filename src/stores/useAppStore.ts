import { create } from 'zustand';
import type { ChildProfile, AppSettings, Language } from '../types';

interface AppState {
  isLoggedIn:     boolean;
  userId:         string | null;
  setLoggedIn:    (id: string | null) => void;
  activeChild:    ChildProfile | null;
  setActiveChild: (child: ChildProfile | null) => void;
  children:       ChildProfile[];
  setChildren:    (children: ChildProfile[]) => void;
  isPremium:      boolean;
  setIsPremium:   (val: boolean) => void;
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoggedIn:     false,
  userId:         null,
  setLoggedIn:    (id) => set({ isLoggedIn: !!id, userId: id }),
  activeChild:    null,
  setActiveChild: (child) => set({ activeChild: child }),
  children:       [],
  setChildren:    (children) => set({ children }),
  isPremium:      false,
  setIsPremium:   (val) => set({ isPremium: val }),
  settings: {
    language: 'en', theme: 'system',
    sound_enabled: true, music_enabled: true, notifications_enabled: true,
  },
  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
}));
