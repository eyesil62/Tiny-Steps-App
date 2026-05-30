// ============================================================
// Milo's Color World — Color Definitions
// Basic + Special paint colors
// ============================================================

export interface ColorItem {
  id:         string;
  name:       string;
  hex:        string;
  isSpecial:  boolean;
  pattern?:   'rainbow' | 'stars' | 'sparkles' | 'hearts' | 'galaxy' | 'snow' | 'gold' | 'none';
  gradient?:  string[];  // for gradient fills
  unlockAt:   number;    // completed pages needed
}

export const BASIC_COLORS: ColorItem[] = [
  { id: 'red',    name: 'Red',    hex: '#FF3B30', isSpecial: false, pattern: 'none', unlockAt: 0 },
  { id: 'orange', name: 'Orange', hex: '#FF9F43', isSpecial: false, pattern: 'none', unlockAt: 0 },
  { id: 'yellow', name: 'Yellow', hex: '#FFD93D', isSpecial: false, pattern: 'none', unlockAt: 0 },
  { id: 'green',  name: 'Green',  hex: '#34C759', isSpecial: false, pattern: 'none', unlockAt: 0 },
  { id: 'blue',   name: 'Blue',   hex: '#007AFF', isSpecial: false, pattern: 'none', unlockAt: 0 },
  { id: 'purple', name: 'Purple', hex: '#AF52DE', isSpecial: false, pattern: 'none', unlockAt: 0 },
  { id: 'pink',   name: 'Pink',   hex: '#FF2D55', isSpecial: false, pattern: 'none', unlockAt: 0 },
  { id: 'brown',  name: 'Brown',  hex: '#A2845E', isSpecial: false, pattern: 'none', unlockAt: 0 },
  { id: 'black',  name: 'Black',  hex: '#1C1C1E', isSpecial: false, pattern: 'none', unlockAt: 0 },
  { id: 'white',  name: 'White',  hex: '#F2F2F7', isSpecial: false, pattern: 'none', unlockAt: 0 },
  { id: 'gray',   name: 'Gray',   hex: '#8E8E93', isSpecial: false, pattern: 'none', unlockAt: 0 },
  { id: 'mint',   name: 'Mint',   hex: '#5AC8FA', isSpecial: false, pattern: 'none', unlockAt: 0 },
];

export const SPECIAL_COLORS: ColorItem[] = [
  { id: 'rainbow',  name: 'Rainbow',  hex: '#FF6B6B', isSpecial: true, pattern: 'rainbow',  gradient: ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C77DFF'], unlockAt: 0 },
  { id: 'gold',     name: 'Gold',     hex: '#FFD700', isSpecial: true, pattern: 'gold',     gradient: ['#FFD700','#FFA500'], unlockAt: 0 },
  { id: 'galaxy',   name: 'Galaxy',   hex: '#1a1040', isSpecial: true, pattern: 'galaxy',   gradient: ['#1a1040','#6B35C7','#4D96FF'], unlockAt: 3  },
  { id: 'sparkles', name: 'Sparkles', hex: '#C77DFF', isSpecial: true, pattern: 'sparkles', gradient: ['#C77DFF','#FFD93D'], unlockAt: 5  },
  { id: 'snow',     name: 'Snow',     hex: '#E3F4F9', isSpecial: true, pattern: 'snow',     gradient: ['#E3F4F9','#ffffff'], unlockAt: 8  },
  { id: 'fire',     name: 'Fire',     hex: '#FF4500', isSpecial: true, pattern: 'none',     gradient: ['#FF4500','#FFD700'], unlockAt: 10 },
  { id: 'ocean',    name: 'Ocean',    hex: '#1e90ff', isSpecial: true, pattern: 'none',     gradient: ['#1e90ff','#40e0d0'], unlockAt: 15 },
  { id: 'neon',     name: 'Neon',     hex: '#39FF14', isSpecial: true, pattern: 'none',     gradient: ['#39FF14','#00FFFF'], unlockAt: 20 },
];

export const ALL_COLORS = [...BASIC_COLORS, ...SPECIAL_COLORS];

export function getColorById(id: string): ColorItem {
  return ALL_COLORS.find(c => c.id === id) ?? BASIC_COLORS[0];
}

export function getDisplayColor(color: ColorItem): string {
  if (color.gradient && color.gradient.length > 0) return color.gradient[0];
  return color.hex;
}
