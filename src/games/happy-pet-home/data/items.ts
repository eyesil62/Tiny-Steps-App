// Room furniture and decoration items
export interface RoomItem {
  id:       string;
  emoji:    string;
  name:     string;
  category: 'furniture' | 'toy' | 'decoration' | 'outfit';
  unlockStars: number;
  x: number; // default position %
  y: number;
}

export const ROOM_ITEMS: RoomItem[] = [
  // Always present
  { id: 'bed',        emoji: '🛏️',  name: 'Cosy Bed',     category: 'furniture',  unlockStars: 0,   x: 10, y: 45 },
  { id: 'food-bowl',  emoji: '🥣',  name: 'Food Bowl',    category: 'furniture',  unlockStars: 0,   x: 55, y: 72 },
  { id: 'bathtub',    emoji: '🛁',  name: 'Bathtub',      category: 'furniture',  unlockStars: 0,   x: 72, y: 38 },
  { id: 'toy-basket', emoji: '🧺',  name: 'Toy Basket',   category: 'furniture',  unlockStars: 0,   x: 5,  y: 68 },
  { id: 'window',     emoji: '🪟',  name: 'Window',       category: 'furniture',  unlockStars: 0,   x: 40, y: 12 },
  { id: 'rug',        emoji: '🟥',  name: 'Soft Rug',     category: 'furniture',  unlockStars: 0,   x: 38, y: 65 },
  // Unlockable
  { id: 'ball',       emoji: '⚽',  name: 'Play Ball',    category: 'toy',        unlockStars: 10,  x: 30, y: 70 },
  { id: 'teddy',      emoji: '🧸',  name: 'Teddy Bear',   category: 'toy',        unlockStars: 20,  x: 20, y: 55 },
  { id: 'plant',      emoji: '🪴',  name: 'Plant',        category: 'decoration', unlockStars: 15,  x: 85, y: 55 },
  { id: 'lamp',       emoji: '🪔',  name: 'Night Lamp',   category: 'decoration', unlockStars: 25,  x: 60, y: 42 },
  { id: 'painting',   emoji: '🖼️',  name: 'Painting',     category: 'decoration', unlockStars: 30,  x: 75, y: 18 },
  { id: 'fish-tank',  emoji: '🐠',  name: 'Fish Tank',    category: 'decoration', unlockStars: 50,  x: 12, y: 28 },
];

export const TOYS = [
  { id: 'ball',   emoji: '⚽', name: 'Ball',    happyBoost: 25 },
  { id: 'feather',emoji: '🪶', name: 'Feather', happyBoost: 20 },
  { id: 'rope',   emoji: '🎀', name: 'Rope',    happyBoost: 15 },
  { id: 'teddy',  emoji: '🧸', name: 'Teddy',   happyBoost: 30 },
];

export const BLANKETS = [
  { id: 'star',    emoji: '⭐', name: 'Star Blanket',  color: '#FFD93D' },
  { id: 'cloud',   emoji: '☁️', name: 'Cloud Blanket', color: '#E5EFFE' },
  { id: 'heart',   emoji: '❤️', name: 'Heart Blanket', color: '#FFE5E5' },
];
