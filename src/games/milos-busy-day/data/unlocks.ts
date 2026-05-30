export interface UnlockItem {
  id:       string;
  emoji:    string;
  name:     string;
  category: 'outfit' | 'toothbrush' | 'backpack' | 'decoration' | 'pajamas';
  cost:     number;  // stars
}

export const UNLOCK_ITEMS: UnlockItem[] = [
  // Outfits
  { id: 'superhero-shirt', emoji: '🦸', name: 'Superhero Shirt', category: 'outfit',      cost: 15 },
  { id: 'rainbow-dress',   emoji: '🌈', name: 'Rainbow Outfit',  category: 'outfit',      cost: 20 },
  { id: 'sports-kit',      emoji: '⚽', name: 'Sports Kit',      category: 'outfit',      cost: 25 },
  // Toothbrushes
  { id: 'dino-brush',      emoji: '🦕', name: 'Dino Brush',      category: 'toothbrush',  cost: 10 },
  { id: 'rocket-brush',    emoji: '🚀', name: 'Rocket Brush',    category: 'toothbrush',  cost: 15 },
  // Backpacks
  { id: 'rocket-bag',      emoji: '🚀', name: 'Rocket Backpack', category: 'backpack',    cost: 20 },
  { id: 'rainbow-bag',     emoji: '🌈', name: 'Rainbow Bag',     category: 'backpack',    cost: 25 },
  // Pajamas
  { id: 'star-pyjamas',    emoji: '⭐', name: 'Star Pyjamas',    category: 'pajamas',     cost: 15 },
  { id: 'moon-pyjamas',    emoji: '🌙', name: 'Moon Pyjamas',    category: 'pajamas',     cost: 20 },
  // Decorations
  { id: 'rainbow-rug',     emoji: '🌈', name: 'Rainbow Rug',     category: 'decoration',  cost: 30 },
  { id: 'moon-lamp',       emoji: '🌙', name: 'Moon Lamp',       category: 'decoration',  cost: 35 },
];
