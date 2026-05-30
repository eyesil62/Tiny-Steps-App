// ============================================================
// Happy Pet Home — Pet Data
// Original characters, no IP infringement
// ============================================================

export type PetId = 'puppy' | 'kitten' | 'bunny' | 'duckling';

export interface Pet {
  id:          PetId;
  name:        string;       // default name
  emoji:       string;       // main display
  sleepEmoji:  string;       // when sleeping
  happyEmoji:  string;       // when very happy
  hungryEmoji: string;       // when hungry
  cleanEmoji:  string;       // after bath
  dirtyEmoji:  string;       // needs bath
  color:       string;       // theme color
  colorLight:  string;       // light variant
  description: string;
  sounds: {
    happy:   string;  // speech text for happy sound
    hungry:  string;
    sleepy:  string;
    clean:   string;
    play:    string;
    greet:   string;
  };
  favoriteFoods: FoodItem[];
}

export interface FoodItem {
  id:    string;
  emoji: string;
  name:  string;
  hungerBoost: number;
}

export const FOODS: FoodItem[] = [
  { id: 'apple',   emoji: '🍎', name: 'Apple',   hungerBoost: 20 },
  { id: 'carrot',  emoji: '🥕', name: 'Carrot',  hungerBoost: 25 },
  { id: 'milk',    emoji: '🥛', name: 'Milk',    hungerBoost: 30 },
  { id: 'biscuit', emoji: '🍪', name: 'Biscuit', hungerBoost: 15 },
  { id: 'bone',    emoji: '🦴', name: 'Bone',    hungerBoost: 35 },
  { id: 'fish',    emoji: '🐟', name: 'Fish',    hungerBoost: 30 },
  { id: 'lettuce', emoji: '🥬', name: 'Lettuce', hungerBoost: 20 },
  { id: 'corn',    emoji: '🌽', name: 'Corn',    hungerBoost: 20 },
];

export const PETS: Pet[] = [
  {
    id: 'puppy',
    name: 'Buddy',
    emoji:       '🐶',
    sleepEmoji:  '😴',
    happyEmoji:  '🐕',
    hungryEmoji: '🐶',
    cleanEmoji:  '🐩',
    dirtyEmoji:  '🐶',
    color:       '#FF9F43',
    colorLight:  '#FFF0DC',
    description: 'A playful little puppy who loves to fetch and cuddle!',
    sounds: {
      happy:  'Woof woof! I am so happy!',
      hungry: 'Woof! I am hungry! Please feed me!',
      sleepy: 'Yaaaawn... I am so sleepy.',
      clean:  'Splish splash! I love my bath!',
      play:   'Woof woof! Let\'s play fetch!',
      greet:  'Woof woof! I missed you so much!',
    },
    favoriteFoods: ['bone', 'milk', 'biscuit', 'apple'].map(id => FOODS.find(f => f.id === id)!),
  },
  {
    id: 'kitten',
    name: 'Luna',
    emoji:       '🐱',
    sleepEmoji:  '😴',
    happyEmoji:  '😸',
    hungryEmoji: '😿',
    cleanEmoji:  '🐈',
    dirtyEmoji:  '🐱',
    color:       '#C77DFF',
    colorLight:  '#F3E5FF',
    description: 'A curious kitten who loves to explore and purr!',
    sounds: {
      happy:  'Purrr... I am so happy! Meow!',
      hungry: 'Meow meow! My tummy is rumbling!',
      sleepy: 'Mrrr... time to curl up and nap.',
      clean:  'Meow! I am clean and fluffy now!',
      play:   'Meow! Catch the ball! Pounce!',
      greet:  'Meow meow! I missed you!',
    },
    favoriteFoods: ['fish', 'milk', 'biscuit', 'carrot'].map(id => FOODS.find(f => f.id === id)!),
  },
  {
    id: 'bunny',
    name: 'Cotton',
    emoji:       '🐰',
    sleepEmoji:  '😴',
    happyEmoji:  '🐇',
    hungryEmoji: '🐰',
    cleanEmoji:  '🐰',
    dirtyEmoji:  '🐰',
    color:       '#FF6B6B',
    colorLight:  '#FFE5E5',
    description: 'A fluffy bunny who loves carrots and hopping around!',
    sounds: {
      happy:  'Boing boing! I am so happy! Squeak!',
      hungry: 'Squeak squeak! I want a carrot please!',
      sleepy: 'Mmmm... time to snuggle in my burrow.',
      clean:  'Oh so soft and fluffy! Thank you!',
      play:   'Boing boing! Let\'s hop and play!',
      greet:  'Squeak squeak! You came back!',
    },
    favoriteFoods: ['carrot', 'lettuce', 'apple', 'corn'].map(id => FOODS.find(f => f.id === id)!),
  },
  {
    id: 'duckling',
    name: 'Sunny',
    emoji:       '🐣',
    sleepEmoji:  '😴',
    happyEmoji:  '🐥',
    hungryEmoji: '🐣',
    cleanEmoji:  '🦆',
    dirtyEmoji:  '🐣',
    color:       '#FFD93D',
    colorLight:  '#FFF8DC',
    description: 'A cheerful duckling who loves splashing in puddles!',
    sounds: {
      happy:  'Quack quack! Quack quack! So happy!',
      hungry: 'Quack! Quack! My tummy is empty!',
      sleepy: 'Quaaaack... so tired. Yawn.',
      clean:  'Quack quack! Splish splash! I love water!',
      play:   'Quack quack! Splash splash! Let\'s play!',
      greet:  'Quack quack quack! You\'re back!',
    },
    favoriteFoods: ['corn', 'fish', 'carrot', 'lettuce'].map(id => FOODS.find(f => f.id === id)!),
  },
];

export const getPetById = (id: PetId): Pet => PETS.find(p => p.id === id) ?? PETS[0];
