export interface Sticker { id: string; emoji: string; name: string; }
export interface Toy     { id: string; emoji: string; name: string; world: string; }

export const STICKERS: Sticker[] = [
  { id: 'dog-st',       emoji: '🐶', name: 'Dog' },
  { id: 'cat-st',       emoji: '🐱', name: 'Cat' },
  { id: 'lion-st',      emoji: '🦁', name: 'Lion' },
  { id: 'firetruck-st', emoji: '🚒', name: 'Fire Truck' },
  { id: 'rocket-st',    emoji: '🚀', name: 'Rocket' },
  { id: 'train-st',     emoji: '🚂', name: 'Train' },
  { id: 'trex-st',      emoji: '🦖', name: 'T-Rex' },
  { id: 'stego-st',     emoji: '🦕', name: 'Stegosaurus' },
  { id: 'dolphin-st',   emoji: '🐬', name: 'Dolphin' },
  { id: 'whale-st',     emoji: '🐳', name: 'Whale' },
];

export const TOYS: Toy[] = [
  { id: 'dog-toy',       emoji: '🐶', name: 'Dog Toy',       world: 'zoo'   },
  { id: 'cat-toy',       emoji: '🐱', name: 'Cat Toy',       world: 'zoo'   },
  { id: 'lion-toy',      emoji: '🦁', name: 'Lion Toy',      world: 'zoo'   },
  { id: 'firetruck-toy', emoji: '🚒', name: 'Fire Truck',    world: 'town'  },
  { id: 'rocket-toy',    emoji: '🚀', name: 'Rocket',        world: 'space' },
  { id: 'train-toy',     emoji: '🚂', name: 'Train',         world: 'town'  },
  { id: 'trex-toy',      emoji: '🦖', name: 'T-Rex Toy',     world: 'dino'  },
  { id: 'stego-toy',     emoji: '🦕', name: 'Stego Toy',     world: 'dino'  },
  { id: 'dolphin-toy',   emoji: '🐬', name: 'Dolphin Toy',   world: 'ocean' },
  { id: 'whale-toy',     emoji: '🐳', name: 'Whale Toy',     world: 'ocean' },
];

export const WORLDS = [
  { id: 'zoo',   name: 'Zoo World',   emoji: '🦁', color: '#6BCB77' },
  { id: 'town',  name: 'Town World',  emoji: '🏠', color: '#FFD93D' },
  { id: 'space', name: 'Space World', emoji: '🚀', color: '#C77DFF' },
  { id: 'ocean', name: 'Ocean World', emoji: '🌊', color: '#4D96FF' },
  { id: 'dino',  name: 'Dino World',  emoji: '🦕', color: '#FF9F43' },
];

export const BADGES = [
  { level: 1, title: 'Tiny Solver',   emoji: '🧩', minPuzzles: 0  },
  { level: 2, title: 'Bronze Solver', emoji: '🥉', minPuzzles: 3  },
  { level: 3, title: 'Silver Solver', emoji: '🥈', minPuzzles: 8  },
  { level: 4, title: 'Gold Solver',   emoji: '🥇', minPuzzles: 20 },
  { level: 5, title: 'Master Solver', emoji: '👑', minPuzzles: 30 },
];

export function getBadge(completed: number) {
  return [...BADGES].reverse().find(b => completed >= b.minPuzzles) ?? BADGES[0];
}

export const MYSTERY_BOXES = [
  { atLevel: 5,  reward: '🌈 Rainbow Sticker Pack' },
  { atLevel: 10, reward: '✨ Golden Toy' },
  { atLevel: 15, reward: '🎁 Special Puzzle Frame' },
  { atLevel: 20, reward: '👑 Champion Badge' },
];
