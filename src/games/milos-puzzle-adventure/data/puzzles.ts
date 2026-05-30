// ============================================================
// Milo's Puzzle Adventure — Puzzle Data
// Each puzzle is a scene split into a grid of pieces
// Original TinySteps content
// ============================================================

export type Difficulty = 4 | 6 | 9 | 12 | 16 | 20;
export type CompletionFx = 'bark' | 'launch' | 'flash' | 'roar' | 'move' | 'glow' | 'swim' | 'fly' | 'bounce' | 'drive';

export interface PuzzlePiece {
  id:        string;
  emoji:     string;   // the part shown on this piece
  bgColor:   string;   // piece background tint
  correctSlot: number; // which slot index it belongs to
}

export interface Puzzle {
  id:          string;
  title:       string;
  emoji:       string;       // preview / completed image
  category:    string;
  level:       number;
  pieceCount:  Difficulty;
  gridCols:    number;
  bgColor:     string;
  pieces:      PuzzlePiece[];
  completionFx: CompletionFx;
  completionSpeech: string;
  stickerId:   string;
  toyId:       string;
  world:       string;
  unlockAt:    number;       // puzzles completed before unlock
}

export const CATEGORIES = [
  { id: 'animals',      name: 'Animals',      emoji: '🦁', color: '#6BCB77', unlockAt: 0  },
  { id: 'vehicles',     name: 'Vehicles',     emoji: '🚗', color: '#4D96FF', unlockAt: 0  },
  { id: 'dinosaurs',    name: 'Dinosaurs',    emoji: '🦕', color: '#FF9F43', unlockAt: 3  },
  { id: 'space',        name: 'Space',        emoji: '🚀', color: '#C77DFF', unlockAt: 5  },
  { id: 'ocean',        name: 'Ocean',        emoji: '🐬', color: '#00CED1', unlockAt: 7  },
  { id: 'farm',         name: 'Farm',         emoji: '🐄', color: '#FFD93D', unlockAt: 9  },
];

// Helper: build a simple 4-piece puzzle from quadrant emojis
function makePieces(parts: { emoji: string; color: string }[]): PuzzlePiece[] {
  return parts.map((p, i) => ({
    id: `p${i}`,
    emoji: p.emoji,
    bgColor: p.color,
    correctSlot: i,
  }));
}

export const PUZZLES: Puzzle[] = [

  // ── ANIMALS ──────────────────────────────────────────────
  {
    id: 'dog-puzzle', title: 'Happy Dog', emoji: '🐶', category: 'animals',
    level: 1, pieceCount: 4, gridCols: 2, bgColor: '#E5F7E7', unlockAt: 0,
    completionFx: 'bark', completionSpeech: 'Woof woof! You finished the dog puzzle!',
    stickerId: 'dog-st', toyId: 'dog-toy', world: 'zoo',
    pieces: makePieces([
      { emoji: '👂', color: '#D4A574' }, { emoji: '🐶', color: '#E0B584' },
      { emoji: '🦴', color: '#D4A574' }, { emoji: '🐾', color: '#E0B584' },
    ]),
  },
  {
    id: 'cat-puzzle', title: 'Cute Cat', emoji: '🐱', category: 'animals',
    level: 2, pieceCount: 4, gridCols: 2, bgColor: '#FFF0DC', unlockAt: 0,
    completionFx: 'bounce', completionSpeech: 'Meow! The cat puzzle is complete!',
    stickerId: 'cat-st', toyId: 'cat-toy', world: 'zoo',
    pieces: makePieces([
      { emoji: '👂', color: '#FFB347' }, { emoji: '🐱', color: '#FFC773' },
      { emoji: '🐾', color: '#FFB347' }, { emoji: '🧶', color: '#FFC773' },
    ]),
  },
  {
    id: 'lion-puzzle', title: 'Brave Lion', emoji: '🦁', category: 'animals',
    level: 3, pieceCount: 4, gridCols: 2, bgColor: '#FFF8DC', unlockAt: 1,
    completionFx: 'roar', completionSpeech: 'ROAR! What a magnificent lion!',
    stickerId: 'lion-st', toyId: 'lion-toy', world: 'zoo',
    pieces: makePieces([
      { emoji: '🦁', color: '#E8A317' }, { emoji: '☀️', color: '#F0B52A' },
      { emoji: '🐾', color: '#E8A317' }, { emoji: '🌾', color: '#F0B52A' },
    ]),
  },

  // ── VEHICLES ──────────────────────────────────────────────
  {
    id: 'firetruck-puzzle', title: 'Fire Truck', emoji: '🚒', category: 'vehicles',
    level: 4, pieceCount: 4, gridCols: 2, bgColor: '#FFE5E5', unlockAt: 0,
    completionFx: 'flash', completionSpeech: 'Nee naw! The fire truck is ready to help!',
    stickerId: 'firetruck-st', toyId: 'firetruck-toy', world: 'town',
    pieces: makePieces([
      { emoji: '🚨', color: '#FF6B6B' }, { emoji: '🪜', color: '#FF8585' },
      { emoji: '🚒', color: '#FF6B6B' }, { emoji: '🛞', color: '#FF8585' },
    ]),
  },
  {
    id: 'rocket-puzzle', title: 'Space Rocket', emoji: '🚀', category: 'vehicles',
    level: 5, pieceCount: 4, gridCols: 2, bgColor: '#E5EFFE', unlockAt: 1,
    completionFx: 'launch', completionSpeech: '3, 2, 1, blast off! Amazing rocket!',
    stickerId: 'rocket-st', toyId: 'rocket-toy', world: 'space',
    pieces: makePieces([
      { emoji: '🔺', color: '#FF6B6B' }, { emoji: '🪟', color: '#7FB3FF' },
      { emoji: '🚀', color: '#A8CFFF' }, { emoji: '🔥', color: '#FFB347' },
    ]),
  },
  {
    id: 'train-puzzle', title: 'Choo Choo Train', emoji: '🚂', category: 'vehicles',
    level: 6, pieceCount: 4, gridCols: 2, bgColor: '#E5F7E7', unlockAt: 2,
    completionFx: 'move', completionSpeech: 'Choo choo! All aboard the train!',
    stickerId: 'train-st', toyId: 'train-toy', world: 'town',
    pieces: makePieces([
      { emoji: '🚂', color: '#6BCB77' }, { emoji: '💨', color: '#8FD89A' },
      { emoji: '🛤️', color: '#6BCB77' }, { emoji: '🚃', color: '#8FD89A' },
    ]),
  },

  // ── DINOSAURS ─────────────────────────────────────────────
  {
    id: 'trex-puzzle', title: 'Mighty T-Rex', emoji: '🦖', category: 'dinosaurs',
    level: 7, pieceCount: 4, gridCols: 2, bgColor: '#E5F7E7', unlockAt: 3,
    completionFx: 'roar', completionSpeech: 'ROARRR! The T-Rex is complete!',
    stickerId: 'trex-st', toyId: 'trex-toy', world: 'dino',
    pieces: makePieces([
      { emoji: '🦖', color: '#5DA869' }, { emoji: '🦴', color: '#74BD80' },
      { emoji: '🌿', color: '#5DA869' }, { emoji: '🥚', color: '#74BD80' },
    ]),
  },
  {
    id: 'stego-puzzle', title: 'Stegosaurus', emoji: '🦕', category: 'dinosaurs',
    level: 8, pieceCount: 4, gridCols: 2, bgColor: '#FFF0DC', unlockAt: 3,
    completionFx: 'bounce', completionSpeech: 'Stomp stomp! The Stegosaurus is ready!',
    stickerId: 'stego-st', toyId: 'stego-toy', world: 'dino',
    pieces: makePieces([
      { emoji: '🦕', color: '#FF9F43' }, { emoji: '🌋', color: '#FFB366' },
      { emoji: '🌴', color: '#FF9F43' }, { emoji: '🥚', color: '#FFB366' },
    ]),
  },

  // ── OCEAN ─────────────────────────────────────────────────
  {
    id: 'dolphin-puzzle', title: 'Jumping Dolphin', emoji: '🐬', category: 'ocean',
    level: 9, pieceCount: 4, gridCols: 2, bgColor: '#E5EFFE', unlockAt: 4,
    completionFx: 'swim', completionSpeech: 'Splash! The dolphin loves to play!',
    stickerId: 'dolphin-st', toyId: 'dolphin-toy', world: 'ocean',
    pieces: makePieces([
      { emoji: '🐬', color: '#4D96FF' }, { emoji: '🌊', color: '#7FB3FF' },
      { emoji: '🐚', color: '#4D96FF' }, { emoji: '⭐', color: '#7FB3FF' },
    ]),
  },
  {
    id: 'whale-puzzle', title: 'Big Blue Whale', emoji: '🐳', category: 'ocean',
    level: 10, pieceCount: 4, gridCols: 2, bgColor: '#E5EFFE', unlockAt: 4,
    completionFx: 'swim', completionSpeech: 'Whoosh! The gentle whale swims by!',
    stickerId: 'whale-st', toyId: 'whale-toy', world: 'ocean',
    pieces: makePieces([
      { emoji: '🐳', color: '#4D96FF' }, { emoji: '💦', color: '#7FB3FF' },
      { emoji: '🌊', color: '#4D96FF' }, { emoji: '🐟', color: '#7FB3FF' },
    ]),
  },
];

export const getPuzzlesByCategory = (cat: string) => PUZZLES.filter(p => p.category === cat);
export const getPuzzleById = (id: string) => PUZZLES.find(p => p.id === id);
