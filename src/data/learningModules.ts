// ============================================================
// TinySteps — Learning Content Data
// All learning module content in one place
// ============================================================
import type { AgeGroup } from '../types';

export interface LearningItem {
  id:    string;
  word:  string;
  emoji: string;
  fact?: string; // fun fact for ages 8-10
}

export interface LearningModule {
  id:         string;
  title:      string;
  emoji:      string;
  color:      string;
  colorLight: string;
  ageGroups:  AgeGroup[];
  items:      LearningItem[];
  isPremium:  boolean;
}

export const LEARNING_MODULES: LearningModule[] = [
  // ── ALPHABET ──────────────────────────────────────────────
  {
    id: 'alphabet', title: 'Alphabet', emoji: '🔤',
    color: '#4D96FF', colorLight: '#E5EFFE',
    ageGroups: ['2-4', '5-7', '8-10'], isPremium: false,
    items: [
      { id: 'a', word: 'Apple',     emoji: '🍎' },
      { id: 'b', word: 'Ball',      emoji: '⚽' },
      { id: 'c', word: 'Cat',       emoji: '🐱' },
      { id: 'd', word: 'Dog',       emoji: '🐶' },
      { id: 'e', word: 'Elephant',  emoji: '🐘' },
      { id: 'f', word: 'Fish',      emoji: '🐟' },
      { id: 'g', word: 'Giraffe',   emoji: '🦒' },
      { id: 'h', word: 'House',     emoji: '🏠' },
      { id: 'i', word: 'Ice cream', emoji: '🍦' },
      { id: 'j', word: 'Jellyfish', emoji: '🪼' },
      { id: 'k', word: 'Koala',     emoji: '🐨' },
      { id: 'l', word: 'Lion',      emoji: '🦁' },
      { id: 'm', word: 'Moon',      emoji: '🌙' },
      { id: 'n', word: 'Nest',      emoji: '🪺' },
      { id: 'o', word: 'Orange',    emoji: '🍊' },
      { id: 'p', word: 'Penguin',   emoji: '🐧' },
      { id: 'q', word: 'Queen',     emoji: '👑' },
      { id: 'r', word: 'Rainbow',   emoji: '🌈' },
      { id: 's', word: 'Sun',       emoji: '☀️' },
      { id: 't', word: 'Tiger',     emoji: '🐯' },
      { id: 'u', word: 'Umbrella',  emoji: '☂️' },
      { id: 'v', word: 'Violin',    emoji: '🎻' },
      { id: 'w', word: 'Whale',     emoji: '🐋' },
      { id: 'x', word: 'Xylophone', emoji: '🎵' },
      { id: 'y', word: 'Yacht',     emoji: '⛵' },
      { id: 'z', word: 'Zebra',     emoji: '🦓' },
    ],
  },

  // ── NUMBERS ───────────────────────────────────────────────
  {
    id: 'numbers', title: 'Numbers', emoji: '🔢',
    color: '#FF6B6B', colorLight: '#FFE5E5',
    ageGroups: ['2-4', '5-7', '8-10'], isPremium: false,
    items: [
      { id: '1',  word: 'One',    emoji: '1️⃣',  fact: 'One is the smallest positive whole number!' },
      { id: '2',  word: 'Two',    emoji: '2️⃣',  fact: 'Two is the only even prime number!' },
      { id: '3',  word: 'Three',  emoji: '3️⃣',  fact: 'Triangles have three sides!' },
      { id: '4',  word: 'Four',   emoji: '4️⃣',  fact: 'A square has four equal sides!' },
      { id: '5',  word: 'Five',   emoji: '5️⃣',  fact: 'We have five fingers on each hand!' },
      { id: '6',  word: 'Six',    emoji: '6️⃣',  fact: 'Insects have six legs!' },
      { id: '7',  word: 'Seven',  emoji: '7️⃣',  fact: 'There are seven colours in a rainbow!' },
      { id: '8',  word: 'Eight',  emoji: '8️⃣',  fact: 'Spiders have eight legs!' },
      { id: '9',  word: 'Nine',   emoji: '9️⃣',  fact: 'A cat is said to have nine lives!' },
      { id: '10', word: 'Ten',    emoji: '🔟',  fact: 'We count in tens because we have ten fingers!' },
    ],
  },

  // ── COLORS ────────────────────────────────────────────────
  {
    id: 'colors', title: 'Colors', emoji: '🎨',
    color: '#C77DFF', colorLight: '#F3E5FF',
    ageGroups: ['2-4', '5-7', '8-10'], isPremium: false,
    items: [
      { id: 'red',    word: 'Red',    emoji: '🔴', fact: 'Red is the colour of fire engines!' },
      { id: 'blue',   word: 'Blue',   emoji: '🔵', fact: 'The sky and the ocean are blue!' },
      { id: 'yellow', word: 'Yellow', emoji: '🟡', fact: 'The sun is yellow!' },
      { id: 'green',  word: 'Green',  emoji: '🟢', fact: 'Plants are green because of chlorophyll!' },
      { id: 'orange', word: 'Orange', emoji: '🟠', fact: 'Orange is named after the fruit!' },
      { id: 'purple', word: 'Purple', emoji: '🟣', fact: 'Purple was once only for kings and queens!' },
      { id: 'pink',   word: 'Pink',   emoji: '🩷', fact: 'Pink is a mix of red and white!' },
      { id: 'brown',  word: 'Brown',  emoji: '🟫', fact: 'Chocolate and wood are brown!' },
      { id: 'black',  word: 'Black',  emoji: '⚫', fact: 'Black absorbs all light colours!' },
      { id: 'white',  word: 'White',  emoji: '⚪', fact: 'White reflects all light colours!' },
    ],
  },

  // ── ANIMALS ───────────────────────────────────────────────
  {
    id: 'animals', title: 'Animals', emoji: '🐾',
    color: '#6BCB77', colorLight: '#E5F7E7',
    ageGroups: ['2-4', '5-7', '8-10'], isPremium: true,
    items: [
      { id: 'lion',     word: 'Lion',     emoji: '🦁', fact: 'Lions sleep up to 20 hours a day!' },
      { id: 'elephant', word: 'Elephant', emoji: '🐘', fact: 'Elephants are the largest land animals!' },
      { id: 'giraffe',  word: 'Giraffe',  emoji: '🦒', fact: 'Giraffes have the longest necks!' },
      { id: 'penguin',  word: 'Penguin',  emoji: '🐧', fact: 'Penguins cannot fly but love to swim!' },
      { id: 'dolphin',  word: 'Dolphin',  emoji: '🐬', fact: 'Dolphins are very intelligent!' },
      { id: 'owl',      word: 'Owl',      emoji: '🦉', fact: 'Owls can turn their heads 270 degrees!' },
      { id: 'fox',      word: 'Fox',      emoji: '🦊', fact: 'Foxes use the earth\'s magnetic field to hunt!' },
      { id: 'bear',     word: 'Bear',     emoji: '🐻', fact: 'Bears hibernate in winter!' },
    ],
  },

  // ── SHAPES ────────────────────────────────────────────────
  {
    id: 'shapes', title: 'Shapes', emoji: '🔷',
    color: '#FF9F43', colorLight: '#FFF0DC',
    ageGroups: ['2-4', '5-7'], isPremium: true,
    items: [
      { id: 'circle',   word: 'Circle',   emoji: '⭕' },
      { id: 'square',   word: 'Square',   emoji: '🟥' },
      { id: 'triangle', word: 'Triangle', emoji: '🔺' },
      { id: 'star',     word: 'Star',     emoji: '⭐' },
      { id: 'heart',    word: 'Heart',    emoji: '❤️' },
      { id: 'diamond',  word: 'Diamond',  emoji: '💎' },
      { id: 'oval',     word: 'Oval',     emoji: '🥚' },
      { id: 'rectangle',word: 'Rectangle',emoji: '📱' },
    ],
  },

  // ── FRUITS ────────────────────────────────────────────────
  {
    id: 'fruits', title: 'Fruits', emoji: '🍎',
    color: '#FF6B6B', colorLight: '#FFE5E5',
    ageGroups: ['2-4', '5-7', '8-10'], isPremium: true,
    items: [
      { id: 'apple',      word: 'Apple',      emoji: '🍎' },
      { id: 'banana',     word: 'Banana',     emoji: '🍌' },
      { id: 'strawberry', word: 'Strawberry', emoji: '🍓' },
      { id: 'orange',     word: 'Orange',     emoji: '🍊' },
      { id: 'grapes',     word: 'Grapes',     emoji: '🍇' },
      { id: 'watermelon', word: 'Watermelon', emoji: '🍉' },
      { id: 'pineapple',  word: 'Pineapple',  emoji: '🍍' },
      { id: 'mango',      word: 'Mango',      emoji: '🥭' },
    ],
  },
];

export const getFreeModules  = () => LEARNING_MODULES.filter(m => !m.isPremium);
export const getModuleById   = (id: string) => LEARNING_MODULES.find(m => m.id === id);
export const getModulesForAge = (age: AgeGroup) =>
  LEARNING_MODULES.filter(m => m.ageGroups.includes(age));
