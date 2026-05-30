// ============================================================
// Milo's Color World — Coloring Pages Data
// Each page has regions the child taps to fill with color
// ============================================================

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface ColorRegion {
  id:           string;
  label:        string;
  emoji:        string;       // shown as hint before coloring
  hintColor:    string;       // suggested color hint
  row:          number;       // grid row (0-indexed)
  col:          number;       // grid column (0-indexed)
  rowSpan?:     number;       // how many rows it spans
  colSpan?:     number;
  size:         'sm' | 'md' | 'lg' | 'xl'; // visual size
}

export interface ColoringPage {
  id:           string;
  title:        string;
  emoji:        string;       // preview emoji
  category:     string;
  difficulty:   Difficulty;
  regions:      ColorRegion[];
  completionAnimation: 'bounce' | 'fly' | 'spin' | 'roar' | 'glow' | 'launch' | 'swim' | 'drive';
  completionSpeech: string;
  stickerId:    string;
  toyId:        string;
  worldContribution: { world: string; buildingId: string };
  unlockAt:     number;       // pages completed before this unlocks
}

export const CATEGORIES = [
  { id: 'animals',   name: 'Animals',    emoji: '🦁', color: '#6BCB77', unlockAt: 0  },
  { id: 'vehicles',  name: 'Vehicles',   emoji: '🚗', color: '#4D96FF', unlockAt: 0  },
  { id: 'dinosaurs', name: 'Dinosaurs',  emoji: '🦕', color: '#FF9F43', unlockAt: 5  },
  { id: 'ocean',     name: 'Ocean',      emoji: '🐬', color: '#00CED1', unlockAt: 8  },
  { id: 'space',     name: 'Space',      emoji: '🚀', color: '#C77DFF', unlockAt: 12 },
  { id: 'fantasy',   name: 'Fantasy',    emoji: '🐉', color: '#FF6B6B', unlockAt: 15 },
  { id: 'food',      name: 'Yummy Food', emoji: '🍕', color: '#FF9F43', unlockAt: 3  },
  { id: 'town',      name: 'TinyTown',   emoji: '🏠', color: '#FFD93D', unlockAt: 6  },
];

export const COLORING_PAGES: ColoringPage[] = [

  // ── ANIMALS ──────────────────────────────────────────────

  {
    id: 'dog', title: 'Friendly Dog', emoji: '🐶', category: 'animals',
    difficulty: 1, unlockAt: 0,
    completionAnimation: 'bounce', completionSpeech: 'Woof woof! Your dog is beautiful!',
    stickerId: 'dog-sticker', toyId: 'dog-toy',
    worldContribution: { world: 'zoo', buildingId: 'dog-zone' },
    regions: [
      { id: 'head',  label: 'Head',  emoji: '🤎', hintColor: 'brown',  row: 0, col: 1, size: 'xl', rowSpan: 2, colSpan: 2 },
      { id: 'ears',  label: 'Ears',  emoji: '🟤', hintColor: 'brown',  row: 0, col: 0, size: 'md' },
      { id: 'nose',  label: 'Nose',  emoji: '⬛', hintColor: 'black',  row: 1, col: 3, size: 'sm' },
      { id: 'body',  label: 'Body',  emoji: '🟤', hintColor: 'brown',  row: 2, col: 0, size: 'xl', rowSpan: 2, colSpan: 3 },
      { id: 'spots', label: 'Spots', emoji: '⬛', hintColor: 'black',  row: 2, col: 3, size: 'md' },
      { id: 'tail',  label: 'Tail',  emoji: '🟤', hintColor: 'brown',  row: 3, col: 3, size: 'sm' },
      { id: 'paws',  label: 'Paws',  emoji: '⬜', hintColor: 'white',  row: 4, col: 0, size: 'md', colSpan: 2 },
      { id: 'collar',label: 'Collar',emoji: '🔴', hintColor: 'red',    row: 4, col: 2, size: 'md' },
    ],
  },

  {
    id: 'cat', title: 'Cute Cat', emoji: '🐱', category: 'animals',
    difficulty: 1, unlockAt: 0,
    completionAnimation: 'bounce', completionSpeech: 'Purrr! Your cat is purr-fect!',
    stickerId: 'cat-sticker', toyId: 'cat-toy',
    worldContribution: { world: 'zoo', buildingId: 'cat-zone' },
    regions: [
      { id: 'head',   label: 'Head',   emoji: '🟠', hintColor: 'orange', row: 0, col: 1, size: 'xl', rowSpan: 2, colSpan: 2 },
      { id: 'ears',   label: 'Ears',   emoji: '🟠', hintColor: 'orange', row: 0, col: 0, size: 'sm' },
      { id: 'eyes',   label: 'Eyes',   emoji: '💚', hintColor: 'green',  row: 1, col: 0, size: 'sm' },
      { id: 'nose',   label: 'Nose',   emoji: '🩷', hintColor: 'pink',   row: 1, col: 3, size: 'sm' },
      { id: 'body',   label: 'Body',   emoji: '🟠', hintColor: 'orange', row: 2, col: 0, size: 'xl', colSpan: 3, rowSpan: 2 },
      { id: 'stripes',label: 'Stripes',emoji: '🟤', hintColor: 'brown',  row: 2, col: 3, size: 'md' },
      { id: 'tail',   label: 'Tail',   emoji: '🟠', hintColor: 'orange', row: 3, col: 3, size: 'md' },
      { id: 'paws',   label: 'Paws',   emoji: '⬜', hintColor: 'white',  row: 4, col: 0, size: 'lg', colSpan: 2 },
    ],
  },

  {
    id: 'lion', title: 'Mighty Lion', emoji: '🦁', category: 'animals',
    difficulty: 2, unlockAt: 2,
    completionAnimation: 'roar', completionSpeech: 'ROAR! You colored a magnificent lion!',
    stickerId: 'lion-sticker', toyId: 'lion-toy',
    worldContribution: { world: 'zoo', buildingId: 'lion-zone' },
    regions: [
      { id: 'mane',   label: 'Mane',   emoji: '🟤', hintColor: 'brown',  row: 0, col: 0, size: 'xl', rowSpan: 3, colSpan: 4 },
      { id: 'face',   label: 'Face',   emoji: '🟡', hintColor: 'yellow', row: 1, col: 1, size: 'xl', rowSpan: 2, colSpan: 2 },
      { id: 'eyes',   label: 'Eyes',   emoji: '🟡', hintColor: 'yellow', row: 1, col: 0, size: 'sm' },
      { id: 'nose',   label: 'Nose',   emoji: '🩷', hintColor: 'pink',   row: 2, col: 3, size: 'sm' },
      { id: 'body',   label: 'Body',   emoji: '🟡', hintColor: 'yellow', row: 3, col: 0, size: 'xl', rowSpan: 2, colSpan: 3 },
      { id: 'tail',   label: 'Tail',   emoji: '🟤', hintColor: 'brown',  row: 3, col: 3, size: 'md' },
      { id: 'paws',   label: 'Paws',   emoji: '🟡', hintColor: 'yellow', row: 4, col: 3, size: 'md' },
    ],
  },

  // ── VEHICLES ──────────────────────────────────────────────

  {
    id: 'fire-truck', title: 'Fire Truck', emoji: '🚒', category: 'vehicles',
    difficulty: 2, unlockAt: 0,
    completionAnimation: 'drive', completionSpeech: 'Nee naw nee naw! Amazing fire truck!',
    stickerId: 'firetruck-sticker', toyId: 'firetruck-toy',
    worldContribution: { world: 'tinytown', buildingId: 'fire-station' },
    regions: [
      { id: 'body',   label: 'Truck Body', emoji: '🔴', hintColor: 'red',    row: 0, col: 0, size: 'xl', rowSpan: 2, colSpan: 4 },
      { id: 'cabin',  label: 'Cabin',      emoji: '🔴', hintColor: 'red',    row: 0, col: 3, size: 'lg', rowSpan: 2 },
      { id: 'ladder', label: 'Ladder',     emoji: '⬜', hintColor: 'white',  row: 0, col: 0, size: 'lg', colSpan: 3 },
      { id: 'windows',label: 'Windows',    emoji: '💙', hintColor: 'blue',   row: 1, col: 3, size: 'sm' },
      { id: 'siren',  label: 'Siren',      emoji: '🔴', hintColor: 'red',    row: 0, col: 4, size: 'sm' },
      { id: 'wheels', label: 'Wheels',     emoji: '⬛', hintColor: 'black',  row: 2, col: 0, size: 'lg', colSpan: 2 },
      { id: 'wheel2', label: 'Wheel 2',    emoji: '⬛', hintColor: 'black',  row: 2, col: 3, size: 'lg' },
      { id: 'lights', label: 'Lights',     emoji: '🟡', hintColor: 'yellow', row: 2, col: 1, size: 'sm' },
    ],
  },

  {
    id: 'rocket', title: 'Space Rocket', emoji: '🚀', category: 'vehicles',
    difficulty: 2, unlockAt: 1,
    completionAnimation: 'launch', completionSpeech: '3... 2... 1... BLAST OFF! Amazing rocket!',
    stickerId: 'rocket-sticker', toyId: 'rocket-toy',
    worldContribution: { world: 'spacebase', buildingId: 'launchpad' },
    regions: [
      { id: 'nose',   label: 'Nose Cone', emoji: '🔴', hintColor: 'red',    row: 0, col: 1, size: 'lg', rowSpan: 2, colSpan: 2 },
      { id: 'body',   label: 'Body',      emoji: '⬜', hintColor: 'white',  row: 2, col: 0, size: 'xl', rowSpan: 2, colSpan: 4 },
      { id: 'window', label: 'Window',    emoji: '💙', hintColor: 'blue',   row: 2, col: 1, size: 'md', colSpan: 2 },
      { id: 'flag',   label: 'Flag',      emoji: '🟡', hintColor: 'yellow', row: 2, col: 3, size: 'sm' },
      { id: 'fins',   label: 'Fins',      emoji: '🔴', hintColor: 'red',    row: 4, col: 0, size: 'md' },
      { id: 'fin2',   label: 'Fin 2',     emoji: '🔴', hintColor: 'red',    row: 4, col: 3, size: 'md' },
      { id: 'flame',  label: 'Flame',     emoji: '🟡', hintColor: 'yellow', row: 5, col: 1, size: 'lg', colSpan: 2 },
    ],
  },

  {
    id: 'school-bus', title: 'School Bus', emoji: '🚌', category: 'vehicles',
    difficulty: 2, unlockAt: 2,
    completionAnimation: 'drive', completionSpeech: 'Beep beep! Time for school!',
    stickerId: 'bus-sticker', toyId: 'bus-toy',
    worldContribution: { world: 'tinytown', buildingId: 'bus-stop' },
    regions: [
      { id: 'body',    label: 'Bus Body',   emoji: '🟡', hintColor: 'yellow', row: 0, col: 0, size: 'xl', rowSpan: 2, colSpan: 5 },
      { id: 'stripe',  label: 'Stripe',     emoji: '⬛', hintColor: 'black',  row: 1, col: 0, size: 'lg', colSpan: 5 },
      { id: 'windows', label: 'Windows',    emoji: '💙', hintColor: 'blue',   row: 0, col: 1, size: 'md', colSpan: 3 },
      { id: 'door',    label: 'Door',       emoji: '🟡', hintColor: 'yellow', row: 0, col: 4, size: 'md', rowSpan: 2 },
      { id: 'wheel1',  label: 'Wheel',      emoji: '⬛', hintColor: 'black',  row: 2, col: 0, size: 'md' },
      { id: 'wheel2',  label: 'Wheel',      emoji: '⬛', hintColor: 'black',  row: 2, col: 3, size: 'md' },
      { id: 'lights',  label: 'Lights',     emoji: '🔴', hintColor: 'red',    row: 2, col: 1, size: 'sm' },
    ],
  },

  // ── DINOSAURS ────────────────────────────────────────────

  {
    id: 'trex', title: 'T-Rex', emoji: '🦖', category: 'dinosaurs',
    difficulty: 3, unlockAt: 5,
    completionAnimation: 'roar', completionSpeech: 'ROARRR! The most fearsome dinosaur is painted!',
    stickerId: 'trex-sticker', toyId: 'trex-toy',
    worldContribution: { world: 'zoo', buildingId: 'dino-zone' },
    regions: [
      { id: 'head',  label: 'Head',   emoji: '🟢', hintColor: 'green',  row: 0, col: 2, size: 'xl', rowSpan: 2, colSpan: 2 },
      { id: 'jaw',   label: 'Jaw',    emoji: '⬜', hintColor: 'white',  row: 1, col: 3, size: 'md' },
      { id: 'teeth', label: 'Teeth',  emoji: '⬜', hintColor: 'white',  row: 2, col: 3, size: 'sm' },
      { id: 'body',  label: 'Body',   emoji: '🟢', hintColor: 'green',  row: 2, col: 0, size: 'xl', rowSpan: 3, colSpan: 3 },
      { id: 'belly', label: 'Belly',  emoji: '🟡', hintColor: 'yellow', row: 2, col: 1, size: 'lg', rowSpan: 2 },
      { id: 'arm',   label: 'Arms',   emoji: '🟢', hintColor: 'green',  row: 2, col: 3, size: 'md', rowSpan: 2 },
      { id: 'legs',  label: 'Legs',   emoji: '🟢', hintColor: 'green',  row: 4, col: 0, size: 'xl', colSpan: 3 },
      { id: 'spikes',label: 'Spikes', emoji: '🟤', hintColor: 'brown',  row: 0, col: 0, size: 'md', colSpan: 2 },
    ],
  },

  // ── OCEAN ─────────────────────────────────────────────────

  {
    id: 'dolphin', title: 'Jumping Dolphin', emoji: '🐬', category: 'ocean',
    difficulty: 2, unlockAt: 3,
    completionAnimation: 'swim', completionSpeech: 'Splash! Your dolphin loves to jump and play!',
    stickerId: 'dolphin-sticker', toyId: 'dolphin-toy',
    worldContribution: { world: 'ocean', buildingId: 'dolphin-cove' },
    regions: [
      { id: 'body',    label: 'Body',    emoji: '💙', hintColor: 'blue',   row: 0, col: 0, size: 'xl', rowSpan: 3, colSpan: 4 },
      { id: 'belly',   label: 'Belly',   emoji: '⬜', hintColor: 'white',  row: 1, col: 1, size: 'xl', colSpan: 2 },
      { id: 'eye',     label: 'Eye',     emoji: '⬛', hintColor: 'black',  row: 0, col: 3, size: 'sm' },
      { id: 'fin-top', label: 'Top Fin', emoji: '💙', hintColor: 'blue',   row: 0, col: 1, size: 'md' },
      { id: 'fin-side',label: 'Side Fin',emoji: '💙', hintColor: 'blue',   row: 2, col: 3, size: 'md' },
      { id: 'tail',    label: 'Tail',    emoji: '💙', hintColor: 'blue',   row: 3, col: 2, size: 'lg', colSpan: 2 },
    ],
  },

  // ── SPACE ─────────────────────────────────────────────────

  {
    id: 'planet', title: 'Colorful Planet', emoji: '🪐', category: 'space',
    difficulty: 2, unlockAt: 4,
    completionAnimation: 'glow', completionSpeech: 'Wow! Your planet is out of this world!',
    stickerId: 'planet-sticker', toyId: 'planet-toy',
    worldContribution: { world: 'spacebase', buildingId: 'solar-system' },
    regions: [
      { id: 'planet',  label: 'Planet',  emoji: '🔵', hintColor: 'blue',   row: 0, col: 0, size: 'xl', rowSpan: 4, colSpan: 4 },
      { id: 'ring1',   label: 'Ring',    emoji: '🟡', hintColor: 'yellow', row: 1, col: 0, size: 'xl', colSpan: 4 },
      { id: 'crater1', label: 'Crater',  emoji: '🟤', hintColor: 'brown',  row: 1, col: 1, size: 'md' },
      { id: 'crater2', label: 'Crater',  emoji: '🟤', hintColor: 'brown',  row: 2, col: 3, size: 'sm' },
      { id: 'surface', label: 'Surface', emoji: '🟢', hintColor: 'green',  row: 3, col: 0, size: 'lg', colSpan: 2 },
      { id: 'star1',   label: 'Star',    emoji: '⭐', hintColor: 'yellow', row: 0, col: 4, size: 'sm' },
      { id: 'star2',   label: 'Star',    emoji: '⭐', hintColor: 'yellow', row: 2, col: 4, size: 'sm' },
    ],
  },

  // ── FOOD ──────────────────────────────────────────────────

  {
    id: 'pizza', title: 'Yummy Pizza', emoji: '🍕', category: 'food',
    difficulty: 2, unlockAt: 0,
    completionAnimation: 'bounce', completionSpeech: 'Mamma mia! That pizza looks delicious!',
    stickerId: 'pizza-sticker', toyId: 'pizza-toy',
    worldContribution: { world: 'tinytown', buildingId: 'cafe' },
    regions: [
      { id: 'crust',  label: 'Crust',   emoji: '🟤', hintColor: 'brown',  row: 0, col: 0, size: 'xl', rowSpan: 1, colSpan: 4 },
      { id: 'sauce',  label: 'Sauce',   emoji: '🔴', hintColor: 'red',    row: 1, col: 0, size: 'xl', rowSpan: 2, colSpan: 4 },
      { id: 'cheese', label: 'Cheese',  emoji: '🟡', hintColor: 'yellow', row: 1, col: 1, size: 'xl', colSpan: 2 },
      { id: 'pepperoni',label:'Pepperoni',emoji:'🔴',hintColor:'red',     row: 2, col: 0, size: 'sm' },
      { id: 'pepper2',label: 'Pepperoni',emoji:'🔴',hintColor:'red',      row: 2, col: 2, size: 'sm' },
      { id: 'mushroom',label:'Mushroom',emoji: '🟤', hintColor: 'brown',  row: 2, col: 3, size: 'sm' },
      { id: 'basil',  label: 'Basil',   emoji: '🟢', hintColor: 'green',  row: 3, col: 1, size: 'sm', colSpan: 2 },
    ],
  },

  {
    id: 'ice-cream', title: 'Ice Cream', emoji: '🍦', category: 'food',
    difficulty: 1, unlockAt: 0,
    completionAnimation: 'bounce', completionSpeech: 'Yummy! That ice cream looks so tasty!',
    stickerId: 'icecream-sticker', toyId: 'icecream-toy',
    worldContribution: { world: 'tinytown', buildingId: 'ice-cream-shop' },
    regions: [
      { id: 'scoop1', label: 'Top Scoop',  emoji: '🩷', hintColor: 'pink',   row: 0, col: 1, size: 'xl', rowSpan: 2, colSpan: 2 },
      { id: 'scoop2', label: 'Mid Scoop',  emoji: '🍫', hintColor: 'brown',  row: 2, col: 0, size: 'xl', rowSpan: 2, colSpan: 4 },
      { id: 'sprinkles',label:'Sprinkles', emoji: '🌈', hintColor: 'rainbow',row: 1, col: 0, size: 'md' },
      { id: 'cherry', label: 'Cherry',     emoji: '🔴', hintColor: 'red',    row: 0, col: 0, size: 'sm' },
      { id: 'cone',   label: 'Cone',       emoji: '🟤', hintColor: 'brown',  row: 4, col: 1, size: 'xl', rowSpan: 2, colSpan: 2 },
    ],
  },
];

export const getPagesByCategory = (cat: string) =>
  COLORING_PAGES.filter(p => p.category === cat);

export const getPageById = (id: string) =>
  COLORING_PAGES.find(p => p.id === id);

export const getUnlockedPages = (completedCount: number) =>
  COLORING_PAGES.filter(p => p.unlockAt <= completedCount);
