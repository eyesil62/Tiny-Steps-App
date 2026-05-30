// ============================================================
// Milo's Busy Day — Room & Object Definitions
// Original TinySteps content — all names, objects, characters original
// ============================================================

export type AnimType = 'bounce' | 'wiggle' | 'spin' | 'pulse' | 'slide' | 'pop';

export interface RoomObject {
  id:          string;
  emoji:       string;
  label:       string;
  x:           number;  // % position
  y:           number;
  size:        number;
  animType:    AnimType;
  speech:      string;
  reaction:    string;
  isMissionItem: boolean;   // part of main mission
  missionStep?: string;     // which step this completes
  isHelper:    boolean;     // gives helper stars
  helperStars: number;
  toggle?:     { on: string; off: string; speechOn: string; speechOff: string };
}

export interface Room {
  id:          string;
  name:        string;
  emoji:       string;
  bgColor:     string;
  wallColor:   string;
  floorColor:  string;
  missionStep: string;      // which mission step this room handles
  objects:     RoomObject[];
  completionSpeech: string;
}

export const ROOMS: Room[] = [

  // ── BEDROOM ──────────────────────────────────────────────
  {
    id: 'bedroom', name: 'Milo\'s Bedroom', emoji: '🛏️',
    bgColor: '#FFF3E0', wallColor: '#FFE0CC', floorColor: '#DEB887',
    missionStep: 'wake-up',
    completionSpeech: 'Great job waking up! Now let\'s go to the bathroom!',
    objects: [
      { id: 'alarm',    emoji: '⏰', label: 'Alarm',    x: 72, y: 20, size: 44, animType: 'wiggle', speech: 'Ring ring ring! Time to wake up!', reaction: '🔔', isMissionItem: true,  missionStep: 'stop-alarm',  isHelper: false, helperStars: 0 },
      { id: 'curtains', emoji: '🪟', label: 'Curtains', x: 15, y: 15, size: 54, animType: 'slide',  speech: 'Whoosh! Good morning sunshine!', reaction: '☀️', isMissionItem: true,  missionStep: 'open-curtains', isHelper: false, helperStars: 0 },
      { id: 'bed',      emoji: '🛏️', label: 'Bed',      x: 35, y: 45, size: 68, animType: 'pulse',  speech: 'Let\'s make the bed nice and tidy!', reaction: '✨', isMissionItem: true,  missionStep: 'make-bed',  isHelper: true,  helperStars: 2 },
      { id: 'pyjamas',  emoji: '🧣', label: 'Pyjamas',  x: 58, y: 60, size: 40, animType: 'wiggle', speech: 'Put the pyjamas in the laundry basket!', reaction: '🧺', isMissionItem: true,  missionStep: 'put-pyjamas', isHelper: true, helperStars: 1 },
      { id: 'closet',   emoji: '🚪', label: 'Closet',   x: 6,  y: 30, size: 54, animType: 'pop',    speech: 'What shall Milo wear today?', reaction: '👕', isMissionItem: true,  missionStep: 'choose-outfit', isHelper: false, helperStars: 0 },
      // Fun distractions
      { id: 'toy-bear', emoji: '🧸', label: 'Teddy',    x: 80, y: 55, size: 38, animType: 'bounce', speech: 'Teddy says good morning too! Hug!', reaction: '💕', isMissionItem: false, isHelper: true,  helperStars: 1 },
      { id: 'book',     emoji: '📚', label: 'Books',    x: 5,  y: 62, size: 36, animType: 'wiggle', speech: 'So many good books! Maybe later!', reaction: '📖', isMissionItem: false, isHelper: false, helperStars: 0 },
      { id: 'lamp',     emoji: '💡', label: 'Lamp',     x: 84, y: 30, size: 36, animType: 'pulse',  speech: 'Click!',  reaction: '✨', isMissionItem: false, isHelper: false, helperStars: 0,
        toggle: { on: '💡', off: '🔦', speechOn: 'Lights on! Good morning!', speechOff: 'Lights off. Let\'s use the sunshine!' } },
      { id: 'bird',     emoji: '🐦', label: 'Window Bird', x: 20, y: 5, size: 28, animType: 'bounce', speech: 'Tweet tweet! A bird says good morning!', reaction: '🎵', isMissionItem: false, isHelper: false, helperStars: 0 },
      { id: 'laundry',  emoji: '🧺', label: 'Laundry',  x: 60, y: 72, size: 40, animType: 'pop',   speech: 'Put dirty clothes in the basket!', reaction: '✅', isMissionItem: false, isHelper: true, helperStars: 1 },
    ],
  },

  // ── BATHROOM ──────────────────────────────────────────────
  {
    id: 'bathroom', name: 'Bright Bathroom', emoji: '🛁',
    bgColor: '#E3F2FD', wallColor: '#BBDEFB', floorColor: '#90CAF9',
    missionStep: 'brush-teeth',
    completionSpeech: 'Squeaky clean teeth! Now let\'s go eat breakfast!',
    objects: [
      { id: 'toothpaste',emoji: '🪥', label: 'Toothpaste', x: 22, y: 38, size: 40, animType: 'wiggle', speech: 'Squeeze some toothpaste on the brush!', reaction: '💙', isMissionItem: true, missionStep: 'get-toothpaste', isHelper: false, helperStars: 0 },
      { id: 'brush-top', emoji: '😁', label: 'Top teeth',  x: 42, y: 35, size: 48, animType: 'wiggle', speech: 'Brush the top teeth! Back and forth!', reaction: '✨', isMissionItem: true, missionStep: 'brush-top',  isHelper: false, helperStars: 0 },
      { id: 'brush-bot', emoji: '😬', label: 'Bottom',     x: 42, y: 55, size: 48, animType: 'wiggle', speech: 'Now the bottom teeth! Almost done!', reaction: '✨', isMissionItem: true, missionStep: 'brush-bottom', isHelper: false, helperStars: 0 },
      { id: 'rinse',     emoji: '🥛', label: 'Rinse cup',  x: 65, y: 42, size: 40, animType: 'bounce', speech: 'Spit and rinse! Ahhh so fresh!', reaction: '💦', isMissionItem: true, missionStep: 'rinse', isHelper: false, helperStars: 0 },
      { id: 'mirror',    emoji: '🪞', label: 'Mirror',     x: 50, y: 12, size: 52, animType: 'pulse',  speech: 'Look at those sparkly clean teeth!', reaction: '😄', isMissionItem: false, isHelper: false, helperStars: 0 },
      // Fun distractions
      { id: 'soap',      emoji: '🫧', label: 'Soap',       x: 10, y: 50, size: 38, animType: 'pop',    speech: 'Pop the soap bubbles! Pop pop pop!', reaction: '💦', isMissionItem: false, isHelper: true, helperStars: 1 },
      { id: 'towel',     emoji: '🧸', label: 'Towel',      x: 80, y: 30, size: 42, animType: 'wiggle', speech: 'Hang the towel neatly on the hook!', reaction: '✅', isMissionItem: false, isHelper: true, helperStars: 1 },
      { id: 'rubber-duck',emoji:'🦆', label: 'Duck',       x: 18, y: 68, size: 36, animType: 'bounce', speech: 'Quack quack! The rubber duck loves bathrooms!', reaction: '💛', isMissionItem: false, isHelper: false, helperStars: 0 },
      { id: 'handsoap',  emoji: '🧼', label: 'Hand Soap',  x: 68, y: 60, size: 34, animType: 'wiggle', speech: 'Always wash your hands too!', reaction: '🙌', isMissionItem: false, isHelper: true, helperStars: 1 },
    ],
  },

  // ── KITCHEN ───────────────────────────────────────────────
  {
    id: 'kitchen', name: 'Sunny Kitchen', emoji: '🍳',
    bgColor: '#FFFDE7', wallColor: '#FFF9C4', floorColor: '#E6D5B8',
    missionStep: 'breakfast',
    completionSpeech: 'Yummy breakfast! You have so much energy now!',
    objects: [
      { id: 'cereal',   emoji: '🥣', label: 'Cereal',    x: 12, y: 38, size: 48, animType: 'bounce', speech: 'Pour the cereal! Not too much!', reaction: '🥄', isMissionItem: true, missionStep: 'pour-cereal', isHelper: false, helperStars: 0 },
      { id: 'milk',     emoji: '🥛', label: 'Milk',      x: 28, y: 35, size: 44, animType: 'wiggle', speech: 'Add some cold milk! Glug glug!', reaction: '💧', isMissionItem: true, missionStep: 'add-milk', isHelper: false, helperStars: 0 },
      { id: 'fruit',    emoji: '🍓', label: 'Fruit',     x: 48, y: 40, size: 44, animType: 'bounce', speech: 'Fruit makes breakfast super healthy!', reaction: '😋', isMissionItem: true, missionStep: 'add-fruit', isHelper: false, helperStars: 0 },
      { id: 'eat-bowl', emoji: '😋', label: 'Eat!',      x: 65, y: 50, size: 52, animType: 'pulse',  speech: 'Munch munch! Delicious breakfast!', reaction: '⭐', isMissionItem: true, missionStep: 'eat-breakfast', isHelper: false, helperStars: 0 },
      { id: 'plate',    emoji: '🍽️', label: 'Clean plate',x: 80, y: 55, size: 40, animType: 'pop',   speech: 'All finished! Put the bowl in the sink!', reaction: '✅', isMissionItem: true, missionStep: 'clean-plate', isHelper: true, helperStars: 1 },
      // Distractions
      { id: 'fridge',   emoji: '🥶', label: 'Fridge',    x: 5,  y: 20, size: 54, animType: 'pop',    speech: 'Brr! The fridge is cold! Close it quickly!', reaction: '❄️', isMissionItem: false, isHelper: false, helperStars: 0 },
      { id: 'pet-bowl', emoji: '🐾', label: 'Pet bowl',  x: 72, y: 70, size: 38, animType: 'wiggle', speech: 'Don\'t forget to feed the pet! How kind!', reaction: '🐱', isMissionItem: false, isHelper: true, helperStars: 2 },
      { id: 'spill',    emoji: '💦', label: 'Spill',     x: 50, y: 68, size: 36, animType: 'wiggle', speech: 'Wipe up the little spill! Well done!', reaction: '✅', isMissionItem: false, isHelper: true, helperStars: 1 },
      { id: 'water',    emoji: '💧', label: 'Water cup',  x: 38, y: 60, size: 36, animType: 'bounce', speech: 'Drink some water too! Very healthy!', reaction: '😊', isMissionItem: false, isHelper: true, helperStars: 1 },
    ],
  },

  // ── PLAYROOM ──────────────────────────────────────────────
  {
    id: 'playroom', name: 'Cosy Playroom', emoji: '🎮',
    bgColor: '#F3E5F5', wallColor: '#E1BEE7', floorColor: '#CE93D8',
    missionStep: 'clean-room',
    completionSpeech: 'The playroom is spotless! You are brilliant!',
    objects: [
      { id: 'toy-box',  emoji: '📦', label: 'Toy box',   x: 68, y: 55, size: 54, animType: 'pop',    speech: 'Put the toys in the toy box!', reaction: '✅', isMissionItem: true, missionStep: 'tidy-toys', isHelper: true,  helperStars: 2 },
      { id: 'bookshelf',emoji: '📚', label: 'Bookshelf', x: 6,  y: 28, size: 58, animType: 'pulse',  speech: 'Put the books on the shelf!', reaction: '📖', isMissionItem: true, missionStep: 'tidy-books', isHelper: true, helperStars: 2 },
      { id: 'crayons',  emoji: '🖍️', label: 'Crayons',   x: 40, y: 60, size: 40, animType: 'wiggle', speech: 'Crayons back in the cup!', reaction: '🎨', isMissionItem: true, missionStep: 'tidy-crayons', isHelper: true, helperStars: 1 },
      { id: 'blocks',   emoji: '🧱', label: 'Blocks',    x: 22, y: 58, size: 46, animType: 'bounce', speech: 'Stack the blocks into the box!', reaction: '✅', isMissionItem: true, missionStep: 'tidy-blocks', isHelper: true, helperStars: 1 },
      // Fun items
      { id: 'toy-car',  emoji: '🚗', label: 'Toy car',   x: 52, y: 70, size: 36, animType: 'slide',  speech: 'Vroom! Car goes back to the garage!', reaction: '🚗', isMissionItem: false, isHelper: true,  helperStars: 1 },
      { id: 'puzzle',   emoji: '🧩', label: 'Puzzle',    x: 30, y: 40, size: 38, animType: 'pop',    speech: 'Found a puzzle piece! Brilliant!', reaction: '🎯', isMissionItem: false, isHelper: true,  helperStars: 1 },
      { id: 'radio',    emoji: '📻', label: 'Radio',     x: 80, y: 30, size: 40, animType: 'wiggle', speech: 'Cleanup music on!', reaction: '🎵', isMissionItem: false, isHelper: false, helperStars: 0,
        toggle: { on: '📻', off: '🔇', speechOn: 'Cleanup music on! Cleaning is more fun with music!', speechOff: 'Radio off. So quiet now!' } },
      { id: 'stuffed',  emoji: '🧸', label: 'Stuffed animal', x: 10, y: 55, size: 38, animType: 'bounce', speech: 'Put the stuffed animal on the shelf!', reaction: '💕', isMissionItem: false, isHelper: true,  helperStars: 1 },
      { id: 'picture',  emoji: '🖼️', label: 'Picture frame', x: 82, y: 55, size: 36, animType: 'wiggle', speech: 'Fix the fallen picture frame!', reaction: '✅', isMissionItem: false, isHelper: true,  helperStars: 1 },
    ],
  },

  // ── SCHOOL BAG ────────────────────────────────────────────
  {
    id: 'schoolbag', name: 'School Bag Corner', emoji: '🎒',
    bgColor: '#E8F5E9', wallColor: '#C8E6C9', floorColor: '#A5D6A7',
    missionStep: 'pack-bag',
    completionSpeech: 'Bag all packed! Time for school! Have a great day!',
    objects: [
      { id: 'backpack', emoji: '🎒', label: 'Backpack',  x: 40, y: 35, size: 72, animType: 'pulse',  speech: 'The backpack is ready to be packed!', reaction: '✅', isMissionItem: true, missionStep: 'open-bag', isHelper: false, helperStars: 0 },
      { id: 'book-bag', emoji: '📗', label: 'Book',      x: 8,  y: 38, size: 46, animType: 'bounce', speech: 'Drag the book into the bag!', reaction: '📚', isMissionItem: true, missionStep: 'pack-book',   isHelper: false, helperStars: 0 },
      { id: 'pencil',   emoji: '✏️', label: 'Pencil',    x: 16, y: 60, size: 40, animType: 'wiggle', speech: 'Pencil goes in the bag!', reaction: '✏️', isMissionItem: true, missionStep: 'pack-pencil', isHelper: false, helperStars: 0 },
      { id: 'lunchbox', emoji: '🍱', label: 'Lunchbox',  x: 68, y: 50, size: 44, animType: 'bounce', speech: 'Yummy lunchbox in the bag!', reaction: '😋', isMissionItem: true, missionStep: 'pack-lunch',  isHelper: false, helperStars: 0 },
      { id: 'waterbottle',emoji:'💧', label: 'Water bottle', x: 78, y: 62, size: 38, animType: 'pop', speech: 'Water bottle in! Stay hydrated!', reaction: '💧', isMissionItem: true, missionStep: 'pack-water', isHelper: false, helperStars: 0 },
      // Distractions
      { id: 'toy-wrong',emoji: '🎮', label: 'Game',      x: 55, y: 65, size: 36, animType: 'bounce', speech: 'Not for school! Games stay home today!', reaction: '🏠', isMissionItem: false, isHelper: false, helperStars: 0 },
      { id: 'umbrella', emoji: '☂️', label: 'Umbrella',  x: 22, y: 72, size: 36, animType: 'wiggle', speech: 'Is it going to rain? Check the weather!', reaction: '🌧️', isMissionItem: false, isHelper: false, helperStars: 0 },
      { id: 'badge',    emoji: '🏅', label: 'Badge',     x: 86, y: 38, size: 34, animType: 'spin',   speech: 'Your star badge! You earned this!', reaction: '⭐', isMissionItem: false, isHelper: false, helperStars: 0 },
    ],
  },
];
