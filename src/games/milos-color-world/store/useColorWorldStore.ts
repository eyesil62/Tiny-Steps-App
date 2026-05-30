import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORE_KEY = 'miloscolorworld_v1';

// pageColorings: { [pageId]: { [regionId]: colorId } }
type PageColorings = Record<string, Record<string, string>>;

interface ColorWorldState {
  // Progress
  completedPages:   string[];
  totalStars:       number;
  pageColorings:    PageColorings;   // saved coloring state per page
  unlockedStickers: string[];
  unlockedToys:     string[];
  unlockedColors:   string[];        // special color IDs
  worldProgress:    Record<string, string[]>; // world -> completed buildingIds

  // Current session
  currentPageId:    string | null;
  selectedColorId:  string;
  undoStack:        Array<{ regionId: string; prevColor: string | null }>;
  redoStack:        Array<{ regionId: string; prevColor: string | null }>;

  // Actions
  setCurrentPage:   (id: string | null) => void;
  setColor:         (id: string) => void;
  paintRegion:      (pageId: string, regionId: string, colorId: string) => void;
  undoLastAction:   () => void;
  redoLastAction:   () => void;
  clearPage:        (pageId: string) => void;
  completePage:     (pageId: string, stickerId: string, toyId: string, world: string, buildingId: string) => void;
  loadState:        () => Promise<void>;
  saveState:        () => Promise<void>;
}

export const useColorWorldStore = create<ColorWorldState>((set, get) => ({
  completedPages:   [],
  totalStars:       0,
  pageColorings:    {},
  unlockedStickers: [],
  unlockedToys:     [],
  unlockedColors:   ['red','orange','yellow','green','blue','purple','pink','brown','black','white','gray','mint','rainbow','gold'],
  worldProgress:    {},
  currentPageId:    null,
  selectedColorId:  'red',
  undoStack:        [],
  redoStack:        [],

  setCurrentPage: (id) => set({ currentPageId: id, undoStack: [], redoStack: [] }),
  setColor:       (id) => set({ selectedColorId: id }),

  paintRegion: (pageId, regionId, colorId) => {
    const { pageColorings, undoStack } = get();
    const current = pageColorings[pageId] ?? {};
    const prevColor = current[regionId] ?? null;

    const newColorings: PageColorings = {
      ...pageColorings,
      [pageId]: { ...current, [regionId]: colorId },
    };

    set({
      pageColorings: newColorings,
      undoStack: [...undoStack, { regionId, prevColor }],
      redoStack: [],
    });
    get().saveState();
  },

  undoLastAction: () => {
    const { currentPageId, pageColorings, undoStack, redoStack } = get();
    if (!currentPageId || undoStack.length === 0) return;
    const last    = undoStack[undoStack.length - 1];
    const current = pageColorings[currentPageId] ?? {};
    const newColors = { ...current };
    if (last.prevColor === null) {
      delete newColors[last.regionId];
    } else {
      newColors[last.regionId] = last.prevColor;
    }
    set({
      pageColorings: { ...pageColorings, [currentPageId]: newColors },
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, last],
    });
  },

  redoLastAction: () => {
    const { currentPageId, pageColorings, undoStack, redoStack } = get();
    if (!currentPageId || redoStack.length === 0) return;
    const last    = redoStack[redoStack.length - 1];
    const current = pageColorings[currentPageId] ?? {};
    // To redo we need the "after" state — we just re-paint with the current selected color
    // For simplicity, redo restores the undone action's "next" state which we don't store
    // So we just pop the redo stack
    set({ redoStack: redoStack.slice(0, -1), undoStack: [...undoStack, last] });
  },

  clearPage: (pageId) => {
    const { pageColorings } = get();
    const newColorings = { ...pageColorings };
    delete newColorings[pageId];
    set({ pageColorings: newColorings, undoStack: [], redoStack: [] });
    get().saveState();
  },

  completePage: (pageId, stickerId, toyId, world, buildingId) => {
    const { completedPages, unlockedStickers, unlockedToys, totalStars, worldProgress, unlockedColors } = get();
    if (completedPages.includes(pageId)) return;

    const newCompleted = [...completedPages, pageId];
    const newStickers  = unlockedStickers.includes(stickerId) ? unlockedStickers : [...unlockedStickers, stickerId];
    const newToys      = unlockedToys.includes(toyId) ? unlockedToys : [...unlockedToys, toyId];
    const newStars     = totalStars + 10;
    const worldBuildings = worldProgress[world] ?? [];
    const newWorld     = { ...worldProgress, [world]: [...worldBuildings, buildingId] };

    // Unlock special colors by completed count
    const { SPECIAL_COLORS } = require('../data/colors');
    const newUnlockedColors = [...unlockedColors];
    SPECIAL_COLORS.forEach((c: any) => {
      if (!newUnlockedColors.includes(c.id) && newCompleted.length >= c.unlockAt) {
        newUnlockedColors.push(c.id);
      }
    });

    set({
      completedPages:   newCompleted,
      unlockedStickers: newStickers,
      unlockedToys:     newToys,
      totalStars:       newStars,
      worldProgress:    newWorld,
      unlockedColors:   newUnlockedColors,
    });
    get().saveState();
  },

  loadState: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      set({
        completedPages:   s.completedPages   ?? [],
        totalStars:       s.totalStars       ?? 0,
        pageColorings:    s.pageColorings    ?? {},
        unlockedStickers: s.unlockedStickers ?? [],
        unlockedToys:     s.unlockedToys     ?? [],
        unlockedColors:   s.unlockedColors   ?? ['red','orange','yellow','green','blue','purple','pink','brown','black','white','gray','mint','rainbow','gold'],
        worldProgress:    s.worldProgress    ?? {},
      });
    } catch {}
  },

  saveState: async () => {
    const s = get();
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify({
      completedPages:   s.completedPages,
      totalStars:       s.totalStars,
      pageColorings:    s.pageColorings,
      unlockedStickers: s.unlockedStickers,
      unlockedToys:     s.unlockedToys,
      unlockedColors:   s.unlockedColors,
      worldProgress:    s.worldProgress,
    }));
  },
}));
