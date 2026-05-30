import type { AgeGroup } from '../types';

export interface GameMeta {
  id:          string;
  title:       string;
  emoji:       string;
  description: string;
  color:       string;
  colorLight:  string;
  ageGroups:   AgeGroup[];
  isPremium:   boolean;
  teaches:     string;
  isWorld:     boolean;
  isNew?:      boolean;
}

export const GAMES: GameMeta[] = [
  // ── 5 Premium Mini-World Games ──────────────────────────
  {
    id: 'tiny-town',      title: 'TinyTown Adventures',
    emoji: '🏙️',          description: 'Explore 7 town scenes — tap everything and discover!',
    color: '#FF6B6B',     colorLight: '#FFE5E5',
    ageGroups: ['2-4','5-7'], isPremium: false, isWorld: true, isNew: true,
    teaches: 'World Exploration',
  },
  {
    id: 'builder-buddies',title: 'Builder Buddies',
    emoji: '🚜',           description: 'Drive cute trucks and build bridges, roads and playgrounds!',
    color: '#FF9F43',     colorLight: '#FFF0DC',
    ageGroups: ['2-4','5-7'], isPremium: false, isWorld: true, isNew: true,
    teaches: 'Engineering & Sequence',
  },
  {
    id: 'happy-pet-home', title: 'Happy Pet Home',
    emoji: '🐾',          description: 'Adopt a pet and care for it every day!',
    color: '#6BCB77',     colorLight: '#E5F7E7',
    ageGroups: ['2-4','5-7'], isPremium: true, isWorld: true,
    teaches: 'Responsibility & Care',
  },
  {
    id: 'milos-quest',    title: "Milo's Quest Island",
    emoji: '🗺️',          description: 'Explore 6 island areas, solve puzzles and collect gems!',
    color: '#4D96FF',     colorLight: '#E5EFFE',
    ageGroups: ['5-7','8-10'], isPremium: true, isWorld: true, isNew: true,
    teaches: 'Problem Solving & Science',
  },
  {
    id: 'little-chef',    title: 'Little Chef Cafe',
    emoji: '👨‍🍳',          description: 'Run your own cafe — take orders, cook, serve and decorate!',
    color: '#C77DFF',     colorLight: '#F3E5FF',
    ageGroups: ['5-7','8-10'], isPremium: true, isWorld: true, isNew: true,
    teaches: 'Math, Sequences & Creativity',
  },
  // ── Classic Learning Games ───────────────────────────────
  {
    id: 'balloon-pop',    title: 'Balloon Pop',
    emoji: '🎈',          description: 'Pop the right color balloon — 10 levels!',
    color: '#FF9F43',     colorLight: '#FFF0DC',
    ageGroups: ['2-4','5-7'], isPremium: false, isWorld: false,
    teaches: 'Colors',
  },
  {
    id: 'animal-sounds',  title: 'Animal Sounds',
    emoji: '🦁',          description: 'Hear the sound and match the animal!',
    color: '#6BCB77',     colorLight: '#E5F7E7',
    ageGroups: ['2-4','5-7'], isPremium: false, isWorld: false,
    teaches: 'Animals & Listening',
  },
  {
    id: 'number-count',   title: 'Count & Tap',
    emoji: '🔢',          description: 'Count the objects and tap the right number!',
    color: '#4D96FF',     colorLight: '#E5EFFE',
    ageGroups: ['2-4','5-7','8-10'], isPremium: false, isWorld: false,
    teaches: 'Numbers & Counting',
  },
];

export const getGamesForAge  = (age: AgeGroup) => GAMES.filter(g => g.ageGroups.includes(age));
export const getWorldGames   = (age: AgeGroup) => GAMES.filter(g => g.ageGroups.includes(age) && g.isWorld);
export const getClassicGames = (age: AgeGroup) => GAMES.filter(g => g.ageGroups.includes(age) && !g.isWorld);
export const PREMIUM_WORLD_GAMES = GAMES.filter(g => g.isWorld && g.isPremium);

// New games added
export const NEW_GAMES: GameMeta[] = [
  {
    id: 'milos-busy-day', title: "Milo's Busy Day",
    emoji: '🏠', description: 'Help Milo complete daily routines — with fun distractions!',
    color: '#FF9F43', colorLight: '#FFF0DC',
    ageGroups: ['2-4','5-7'] as ('2-4'|'5-7'|'8-10')[], isPremium: false, isWorld: true, isNew: true,
    teaches: 'Routines & Responsibility',
  },
  {
    id: 'little-champs', title: 'Little Champs Arena',
    emoji: '🏆', description: 'Soccer, basketball and baseball — be a champion!',
    color: '#4D96FF', colorLight: '#E5EFFE',
    ageGroups: ['5-7','8-10'] as ('2-4'|'5-7'|'8-10')[], isPremium: false, isWorld: true, isNew: true,
    teaches: 'Sport & Coordination',
  },
];

// Merge new games into main list
GAMES.splice(2, 0, ...NEW_GAMES);

// Milo's Color World
export const COLOR_WORLD_GAME: GameMeta = {
  id: 'milos-color-world', title: "Milo's Color World",
  emoji: '🎨', description: 'Color pictures, collect stickers, fill your toy shelf!',
  color: '#C77DFF', colorLight: '#F3E5FF',
  ageGroups: ['2-4','5-7','8-10'] as ('2-4'|'5-7'|'8-10')[],
  isPremium: false, isWorld: true, isNew: true,
  teaches: 'Creativity & Colors',
};
GAMES.unshift(COLOR_WORLD_GAME);

// Milo's Puzzle Adventure
export const PUZZLE_GAME: GameMeta = {
  id: 'milos-puzzle', title: "Milo's Puzzle Adventure",
  emoji: '🧩', description: 'Drag & snap puzzles — collect stickers, toys, and build worlds!',
  color: '#C77DFF', colorLight: '#F3E5FF',
  ageGroups: ['2-4','5-7','8-10'] as ('2-4'|'5-7'|'8-10')[],
  isPremium: false, isWorld: true, isNew: true,
  teaches: 'Problem Solving & Shapes',
};
GAMES.unshift(PUZZLE_GAME);
