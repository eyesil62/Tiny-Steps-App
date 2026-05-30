export interface GearItem {
  id:       string;
  emoji:    string;
  name:     string;
  category: 'ball' | 'jersey' | 'shoes' | 'goal' | 'court' | 'hat' | 'bat' | 'glove';
  sport:    'soccer' | 'basketball' | 'baseball' | 'all';
  cost:     number;
  color?:   string;
}

export const GEAR: GearItem[] = [
  // Soccer balls
  { id: 'classic-ball',  emoji: '⚽', name: 'Classic Ball',    category: 'ball',   sport: 'soccer',     cost: 0  },
  { id: 'star-ball',     emoji: '🌟', name: 'Star Ball',       category: 'ball',   sport: 'soccer',     cost: 15 },
  { id: 'rainbow-ball',  emoji: '🌈', name: 'Rainbow Ball',    category: 'ball',   sport: 'soccer',     cost: 25 },
  { id: 'rocket-ball',   emoji: '🚀', name: 'Rocket Ball',     category: 'ball',   sport: 'soccer',     cost: 35 },
  { id: 'golden-ball',   emoji: '🏅', name: 'Golden Ball',     category: 'ball',   sport: 'soccer',     cost: 50 },
  // Basketballs
  { id: 'classic-bball', emoji: '🏀', name: 'Classic Ball',    category: 'ball',   sport: 'basketball', cost: 0  },
  { id: 'fire-bball',    emoji: '🔥', name: 'Fire Ball',       category: 'ball',   sport: 'basketball', cost: 20 },
  { id: 'star-bball',    emoji: '⭐', name: 'Star Ball',       category: 'ball',   sport: 'basketball', cost: 30 },
  // Baseballs
  { id: 'classic-base',  emoji: '⚾', name: 'Classic Ball',    category: 'ball',   sport: 'baseball',   cost: 0  },
  { id: 'lightning-base',emoji: '⚡', name: 'Lightning Ball',  category: 'ball',   sport: 'baseball',   cost: 25 },
  // Jerseys
  { id: 'red-jersey',    emoji: '🔴', name: 'Red Jersey',      category: 'jersey', sport: 'all',        cost: 0  },
  { id: 'blue-jersey',   emoji: '🔵', name: 'Blue Jersey',     category: 'jersey', sport: 'all',        cost: 15 },
  { id: 'champ-jersey',  emoji: '🌟', name: 'Champion Jersey', category: 'jersey', sport: 'all',        cost: 40 },
  // Goals / nets
  { id: 'classic-goal',  emoji: '🥅', name: 'Classic Goal',    category: 'goal',   sport: 'soccer',     cost: 0  },
  { id: 'rainbow-goal',  emoji: '🌈', name: 'Rainbow Net',     category: 'goal',   sport: 'soccer',     cost: 30 },
  // Shoes
  { id: 'red-cleats',    emoji: '👟', name: 'Red Cleats',      category: 'shoes',  sport: 'all',        cost: 20 },
  { id: 'lightning-shoe',emoji: '⚡', name: 'Lightning Shoes', category: 'shoes',  sport: 'all',        cost: 35 },
  // Bats
  { id: 'wood-bat',      emoji: '🏏', name: 'Wooden Bat',      category: 'bat',    sport: 'baseball',   cost: 0  },
  { id: 'power-bat',     emoji: '💥', name: 'Power Bat',       category: 'bat',    sport: 'baseball',   cost: 30 },
];

export const FIELDS = [
  { id: 'backyard',  name: 'Backyard',       emoji: '🏡', color: '#8BC34A', unlockScore: 0    },
  { id: 'school',    name: 'School Ground',  emoji: '🏫', color: '#4D96FF', unlockScore: 50   },
  { id: 'city-park', name: 'City Park',      emoji: '🌳', color: '#6BCB77', unlockScore: 100  },
  { id: 'stadium',   name: 'Mini Stadium',   emoji: '🏟️', color: '#FF9F43', unlockScore: 200  },
  { id: 'champion',  name: 'Champion Arena', emoji: '🏆', color: '#C77DFF', unlockScore: 350  },
];
