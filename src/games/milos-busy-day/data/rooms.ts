// ============================================================
// Milo's Busy Day — Room & Object Definitions
// Original TinySteps content — all names, objects, characters original
// isMissionItem / missionStep removed: mission targets are determined
// at runtime by checking obj.id against missionStep.objects array.
// ============================================================

export type AnimType = 'bounce' | 'wiggle' | 'spin' | 'pulse' | 'slide' | 'pop';

export interface RoomObject {
  id:         string;
  emoji:      string;
  label:      string;
  x:          number; // % position left
  y:          number; // % position top
  size:       number; // font size
  animType:   AnimType;
  speech:     string;
  reaction:   string;
  isHelper:   boolean; // gives bonus helper stars when tapped
  helperStars: number;
  toggle?:    { on: string; off: string; speechOn: string; speechOff: string };
}

export interface Room {
  id:               string;
  name:             string;
  emoji:            string;
  bgColor:          string;
  wallColor:        string;
  floorColor:       string;
  completionSpeech: string;
  objects:          RoomObject[];
}

export const ROOMS: Room[] = [

  // ── BEDROOM ───────────────────────────────────────────────
  {
    id: 'bedroom', name: "Milo's Bedroom", emoji: '🛏️',
    bgColor: '#FFF3E0', wallColor: '#FFE0CC', floorColor: '#DEB887',
    completionSpeech: "Great job! The bedroom is sorted! Let's move on!",
    objects: [
      { id: 'alarm',    emoji: '⏰', label: 'Alarm',    x: 72, y: 20, size: 44, animType: 'wiggle', speech: 'Ring ring ring! Time to wake up!',         reaction: '🔔', isHelper: false, helperStars: 0 },
      { id: 'curtains', emoji: '🪟', label: 'Curtains', x: 15, y: 15, size: 54, animType: 'slide',  speech: 'Whoosh! Good morning sunshine!',            reaction: '☀️', isHelper: false, helperStars: 0 },
      { id: 'bed',      emoji: '🛏️', label: 'Bed',      x: 35, y: 45, size: 68, animType: 'pulse',  speech: "Let's make the bed nice and tidy!",         reaction: '✨', isHelper: true,  helperStars: 2 },
      { id: 'pyjamas',  emoji: '🧣', label: 'Pyjamas',  x: 58, y: 60, size: 40, animType: 'wiggle', speech: 'Put the pyjamas in the laundry basket!',    reaction: '🧺', isHelper: true,  helperStars: 1 },
      { id: 'closet',   emoji: '🚪', label: 'Closet',   x: 6,  y: 30, size: 54, animType: 'pop',    speech: 'What shall Milo wear today?',               reaction: '👕', isHelper: false, helperStars: 0 },
      { id: 'toy-bear', emoji: '🧸', label: 'Teddy',    x: 80, y: 55, size: 38, animType: 'bounce', speech: 'Teddy says good morning too! Hug!',         reaction: '💕', isHelper: true,  helperStars: 1 },
      { id: 'book',     emoji: '📚', label: 'Books',    x: 5,  y: 62, size: 36, animType: 'wiggle', speech: 'So many good books! Maybe after school!',   reaction: '📖', isHelper: false, helperStars: 0 },
      { id: 'lamp',     emoji: '💡', label: 'Lamp',     x: 84, y: 30, size: 36, animType: 'pulse',  speech: 'Click!',                                    reaction: '✨', isHelper: false, helperStars: 0,
        toggle: { on: '💡', off: '🔦', speechOn: 'Lights on! Good morning!', speechOff: "Lights off. Let's use the sunshine!" } },
      { id: 'bird',     emoji: '🐦', label: 'Window Bird', x: 20, y: 5, size: 28, animType: 'bounce', speech: 'Tweet tweet! A bird says good morning!', reaction: '🎵', isHelper: false, helperStars: 0 },
      { id: 'laundry',  emoji: '🧺', label: 'Laundry',  x: 60, y: 72, size: 40, animType: 'pop',    speech: 'Put dirty clothes in the basket!',          reaction: '✅', isHelper: true,  helperStars: 1 },
    ],
  },

  // ── BATHROOM ──────────────────────────────────────────────
  {
    id: 'bathroom', name: 'Bright Bathroom', emoji: '🛁',
    bgColor: '#E3F2FD', wallColor: '#BBDEFB', floorColor: '#90CAF9',
    completionSpeech: "Squeaky clean! You're a hygiene superstar!",
    objects: [
      { id: 'toothpaste', emoji: '🪥', label: 'Toothpaste', x: 22, y: 38, size: 40, animType: 'wiggle', speech: 'Squeeze some toothpaste on the brush!',          reaction: '💙', isHelper: false, helperStars: 0 },
      { id: 'brush-top',  emoji: '😁', label: 'Top teeth',  x: 42, y: 35, size: 48, animType: 'wiggle', speech: 'Brush the top teeth! Back and forth!',           reaction: '✨', isHelper: false, helperStars: 0 },
      { id: 'brush-bot',  emoji: '😬', label: 'Bottom',     x: 42, y: 55, size: 48, animType: 'wiggle', speech: 'Now the bottom teeth! Almost done!',             reaction: '✨', isHelper: false, helperStars: 0 },
      { id: 'rinse',      emoji: '🥛', label: 'Rinse cup',  x: 65, y: 42, size: 40, animType: 'bounce', speech: 'Spit and rinse! Ahhh so fresh!',                 reaction: '💦', isHelper: false, helperStars: 0 },
      { id: 'mirror',     emoji: '🪞', label: 'Mirror',     x: 50, y: 12, size: 52, animType: 'pulse',  speech: 'Look at those sparkly clean teeth!',             reaction: '😄', isHelper: false, helperStars: 0 },
      { id: 'soap',       emoji: '🫧', label: 'Soap',       x: 10, y: 50, size: 38, animType: 'pop',    speech: 'Pop the soap bubbles! Pop pop pop!',             reaction: '💦', isHelper: true,  helperStars: 1 },
      { id: 'towel',      emoji: '🧸', label: 'Towel',      x: 80, y: 30, size: 42, animType: 'wiggle', speech: 'Hang the towel neatly on the hook!',             reaction: '✅', isHelper: true,  helperStars: 1 },
      { id: 'rubber-duck',emoji: '🦆', label: 'Duck',       x: 18, y: 68, size: 36, animType: 'bounce', speech: 'Quack quack! The rubber duck loves bathrooms!',  reaction: '💛', isHelper: false, helperStars: 0 },
      { id: 'handsoap',   emoji: '🧼', label: 'Hand Soap',  x: 68, y: 60, size: 34, animType: 'wiggle', speech: 'Always wash your hands too!',                    reaction: '🙌', isHelper: true,  helperStars: 1 },
    ],
  },

  // ── KITCHEN ───────────────────────────────────────────────
  {
    id: 'kitchen', name: 'Sunny Kitchen', emoji: '🍳',
    bgColor: '#FFFDE7', wallColor: '#FFF9C4', floorColor: '#E6D5B8',
    completionSpeech: 'Yummy! You have so much energy now! Great job!',
    objects: [
      { id: 'cereal',   emoji: '🥣', label: 'Cereal',     x: 12, y: 38, size: 48, animType: 'bounce', speech: 'Pour the cereal! Not too much!',              reaction: '🥄', isHelper: false, helperStars: 0 },
      { id: 'milk',     emoji: '🥛', label: 'Milk',       x: 28, y: 35, size: 44, animType: 'wiggle', speech: 'Add some cold milk! Glug glug!',              reaction: '💧', isHelper: false, helperStars: 0 },
      { id: 'fruit',    emoji: '🍓', label: 'Fruit',      x: 48, y: 40, size: 44, animType: 'bounce', speech: 'Fruit makes breakfast super healthy!',         reaction: '😋', isHelper: false, helperStars: 0 },
      { id: 'eat-bowl', emoji: '😋', label: 'Eat!',       x: 65, y: 50, size: 52, animType: 'pulse',  speech: 'Munch munch! Delicious breakfast!',            reaction: '⭐', isHelper: false, helperStars: 0 },
      { id: 'plate',    emoji: '🍽️', label: 'Clean plate', x: 80, y: 55, size: 40, animType: 'pop',   speech: 'All finished! Put the bowl in the sink!',     reaction: '✅', isHelper: true,  helperStars: 1 },
      { id: 'fridge',   emoji: '🥶', label: 'Fridge',     x: 5,  y: 20, size: 54, animType: 'pop',    speech: "Brr! The fridge is cold! Close it quickly!",  reaction: '❄️', isHelper: false, helperStars: 0 },
      { id: 'pet-bowl', emoji: '🐾', label: 'Pet bowl',   x: 72, y: 70, size: 38, animType: 'wiggle', speech: "Don't forget to feed the pet! How kind!",     reaction: '🐱', isHelper: true,  helperStars: 2 },
      { id: 'spill',    emoji: '💦', label: 'Spill',      x: 50, y: 68, size: 36, animType: 'wiggle', speech: 'Wipe up the little spill! Well done!',         reaction: '✅', isHelper: true,  helperStars: 1 },
      { id: 'water',    emoji: '💧', label: 'Water cup',  x: 38, y: 60, size: 36, animType: 'bounce', speech: 'Drink some water too! Very healthy!',          reaction: '😊', isHelper: true,  helperStars: 1 },
    ],
  },

  // ── PLAYROOM ──────────────────────────────────────────────
  {
    id: 'playroom', name: 'Cosy Playroom', emoji: '🎮',
    bgColor: '#F3E5F5', wallColor: '#E1BEE7', floorColor: '#CE93D8',
    completionSpeech: 'The playroom is spotless! You are absolutely brilliant!',
    objects: [
      { id: 'toy-box',  emoji: '📦', label: 'Toy box',        x: 68, y: 55, size: 54, animType: 'pop',    speech: 'Put the toys in the toy box!',                reaction: '✅', isHelper: true,  helperStars: 2 },
      { id: 'bookshelf',emoji: '📚', label: 'Bookshelf',      x: 6,  y: 28, size: 58, animType: 'pulse',  speech: 'Put the books on the shelf!',                 reaction: '📖', isHelper: true,  helperStars: 2 },
      { id: 'crayons',  emoji: '🖍️', label: 'Crayons',        x: 40, y: 60, size: 40, animType: 'wiggle', speech: 'Crayons back in the cup!',                    reaction: '🎨', isHelper: true,  helperStars: 1 },
      { id: 'blocks',   emoji: '🧱', label: 'Blocks',         x: 22, y: 58, size: 46, animType: 'bounce', speech: 'Stack the blocks into the box!',              reaction: '✅', isHelper: true,  helperStars: 1 },
      { id: 'toy-car',  emoji: '🚗', label: 'Toy car',        x: 52, y: 70, size: 36, animType: 'slide',  speech: 'Vroom! Car goes back to the garage!',         reaction: '🚗', isHelper: true,  helperStars: 1 },
      { id: 'puzzle',   emoji: '🧩', label: 'Puzzle',         x: 30, y: 40, size: 38, animType: 'pop',    speech: 'Found a puzzle piece! Brilliant!',            reaction: '🎯', isHelper: true,  helperStars: 1 },
      { id: 'radio',    emoji: '📻', label: 'Radio',          x: 80, y: 30, size: 40, animType: 'wiggle', speech: 'Cleanup music on!',                           reaction: '🎵', isHelper: false, helperStars: 0,
        toggle: { on: '📻', off: '🔇', speechOn: 'Cleanup music on! Cleaning is more fun with music!', speechOff: 'Radio off. So quiet now!' } },
      { id: 'stuffed',  emoji: '🧸', label: 'Stuffed animal', x: 10, y: 55, size: 38, animType: 'bounce', speech: 'Put the stuffed animal on the shelf!',        reaction: '💕', isHelper: true,  helperStars: 1 },
      { id: 'picture',  emoji: '🖼️', label: 'Picture frame',  x: 82, y: 55, size: 36, animType: 'wiggle', speech: 'Fix the fallen picture frame!',               reaction: '✅', isHelper: true,  helperStars: 1 },
    ],
  },

  // ── SCHOOL BAG ────────────────────────────────────────────
  {
    id: 'schoolbag', name: 'School Bag Corner', emoji: '🎒',
    bgColor: '#E8F5E9', wallColor: '#C8E6C9', floorColor: '#A5D6A7',
    completionSpeech: 'Bag all packed! Time for school! Have a great day!',
    objects: [
      { id: 'backpack',    emoji: '🎒', label: 'Backpack',      x: 40, y: 35, size: 72, animType: 'pulse',  speech: 'The backpack is ready to be packed!',        reaction: '✅', isHelper: false, helperStars: 0 },
      { id: 'book-bag',    emoji: '📗', label: 'Book',          x: 8,  y: 38, size: 46, animType: 'bounce', speech: 'Drag the book into the bag!',                reaction: '📚', isHelper: false, helperStars: 0 },
      { id: 'pencil',      emoji: '✏️', label: 'Pencil',        x: 16, y: 60, size: 40, animType: 'wiggle', speech: 'Pencil goes in the bag!',                    reaction: '✏️', isHelper: false, helperStars: 0 },
      { id: 'lunchbox',    emoji: '🍱', label: 'Lunchbox',      x: 68, y: 50, size: 44, animType: 'bounce', speech: 'Yummy lunchbox in the bag!',                 reaction: '😋', isHelper: false, helperStars: 0 },
      { id: 'waterbottle', emoji: '💧', label: 'Water bottle',  x: 78, y: 62, size: 38, animType: 'pop',    speech: 'Water bottle in! Stay hydrated!',            reaction: '💧', isHelper: false, helperStars: 0 },
      { id: 'toy-wrong',   emoji: '🎮', label: 'Game',          x: 55, y: 65, size: 36, animType: 'bounce', speech: "Not for school! Games stay home today!",     reaction: '🏠', isHelper: false, helperStars: 0 },
      { id: 'umbrella',    emoji: '☂️', label: 'Umbrella',      x: 22, y: 72, size: 36, animType: 'wiggle', speech: 'Is it going to rain? Check the weather!',    reaction: '🌧️', isHelper: false, helperStars: 0 },
      { id: 'badge',       emoji: '🏅', label: 'Badge',         x: 86, y: 38, size: 34, animType: 'spin',   speech: 'Your star badge! You earned this!',          reaction: '⭐', isHelper: false, helperStars: 0 },
    ],
  },

  // ── GARDEN ────────────────────────────────────────────────
  {
    id: 'garden', name: 'Sunny Garden', emoji: '🌻',
    bgColor: '#E8F5E9', wallColor: '#C8E6C9', floorColor: '#81C784',
    completionSpeech: 'The garden looks amazing! You have such a green thumb!',
    objects: [
      { id: 'watering-can', emoji: '🪣', label: 'Watering Can', x: 10, y: 55, size: 46, animType: 'bounce', speech: "Water the flowers! They're so thirsty!",         reaction: '💧', isHelper: false, helperStars: 0 },
      { id: 'flower-pot',   emoji: '🌷', label: 'Flower Pot',   x: 28, y: 48, size: 44, animType: 'wiggle', speech: 'Look how pretty the flowers are growing!',        reaction: '🌸', isHelper: false, helperStars: 0 },
      { id: 'bird-feeder',  emoji: '🐦', label: 'Bird Feeder',  x: 48, y: 22, size: 40, animType: 'bounce', speech: 'The birds love coming to eat here! Tweet tweet!',  reaction: '🎵', isHelper: false, helperStars: 0 },
      { id: 'butterfly',    emoji: '🦋', label: 'Butterfly',    x: 68, y: 30, size: 36, animType: 'spin',   speech: 'A beautiful butterfly! What colours!',             reaction: '🌈', isHelper: true,  helperStars: 1 },
      { id: 'sunshine',     emoji: '☀️', label: 'Sunshine',     x: 82, y: 10, size: 48, animType: 'spin',   speech: 'The warm sunshine helps everything grow!',         reaction: '🌟', isHelper: false, helperStars: 0 },
      { id: 'rake',         emoji: '🌿', label: 'Rake',         x: 5,  y: 35, size: 38, animType: 'slide',  speech: 'Rake the leaves into a pile! Swish swish!',        reaction: '🍂', isHelper: true,  helperStars: 1 },
      { id: 'veggie-patch', emoji: '🥕', label: 'Veggie Patch', x: 38, y: 65, size: 46, animType: 'bounce', speech: "Carrots and tomatoes! Let's harvest the veggies!",  reaction: '🥕', isHelper: true,  helperStars: 1 },
      { id: 'snail',        emoji: '🐌', label: 'Snail',        x: 58, y: 72, size: 32, animType: 'wiggle', speech: 'Hello little snail! Slow and steady!',             reaction: '🐌', isHelper: false, helperStars: 0 },
      { id: 'bee',          emoji: '🐝', label: 'Bee',          x: 75, y: 52, size: 30, animType: 'bounce', speech: 'Buzz buzz! The bee is collecting nectar!',          reaction: '🍯', isHelper: false, helperStars: 0 },
      { id: 'garden-gnome', emoji: '🧙', label: 'Garden Gnome', x: 88, y: 58, size: 38, animType: 'wiggle', speech: 'The garden gnome is watching over the plants!',    reaction: '✨', isHelper: false, helperStars: 0 },
      { id: 'rain-cloud',   emoji: '🌧️', label: 'Rain Cloud',   x: 55, y: 8,  size: 44, animType: 'pulse',  speech: 'A little rain is good for the garden!',            reaction: '🌈', isHelper: false, helperStars: 0,
        toggle: { on: '🌧️', off: '☀️', speechOn: 'Rain cloud! The garden loves rain!', speechOff: 'Back to sunshine! Everything sparkles!' } },
    ],
  },

  // ── LIVING ROOM ───────────────────────────────────────────
  {
    id: 'living-room', name: 'Cosy Living Room', emoji: '🛋️',
    bgColor: '#FFF8E7', wallColor: '#FFECB3', floorColor: '#D7CCC8',
    completionSpeech: 'The living room is perfect! What a wonderful family space!',
    objects: [
      { id: 'dining-table',  emoji: '🪑', label: 'Dining Table',  x: 30, y: 45, size: 56, animType: 'pulse',  speech: "Let's set the table for dinner! Everyone is hungry!", reaction: '🍽️', isHelper: false, helperStars: 0 },
      { id: 'family-plates', emoji: '🍽️', label: 'Plates',        x: 12, y: 52, size: 44, animType: 'wiggle', speech: "Carefully place the plates! Don't drop them!",        reaction: '✅', isHelper: false, helperStars: 0 },
      { id: 'water-jug',     emoji: '💧', label: 'Water Jug',     x: 52, y: 38, size: 40, animType: 'bounce', speech: 'Pour some fresh water for everyone!',                 reaction: '💦', isHelper: false, helperStars: 0 },
      { id: 'bread-basket',  emoji: '🥖', label: 'Bread Basket',  x: 72, y: 50, size: 40, animType: 'wiggle', speech: 'Fresh warm bread! Mmm it smells delicious!',          reaction: '😋', isHelper: false, helperStars: 0 },
      { id: 'sofa',          emoji: '🛋️', label: 'Sofa',          x: 45, y: 65, size: 58, animType: 'pulse',  speech: 'The sofa is so comfy! Perfect for family time!',      reaction: '💕', isHelper: false, helperStars: 0 },
      { id: 'tv',            emoji: '📺', label: 'TV',             x: 15, y: 20, size: 52, animType: 'wiggle', speech: 'What shall we watch tonight?',                        reaction: '🎬', isHelper: false, helperStars: 0,
        toggle: { on: '📺', off: '📺', speechOn: 'TV on! Family movie time!', speechOff: "TV off. Let's talk and play games!" } },
      { id: 'bookshelf-lr',  emoji: '📚', label: 'Bookshelf',     x: 82, y: 30, size: 46, animType: 'pulse',  speech: 'So many wonderful family books to choose from!',      reaction: '📖', isHelper: true,  helperStars: 1 },
      { id: 'family-photo',  emoji: '🖼️', label: 'Family Photo',  x: 5,  y: 30, size: 44, animType: 'pulse',  speech: 'Look at the happy family photo! Everyone is smiling!', reaction: '💕', isHelper: true,  helperStars: 2 },
      { id: 'fireplace',     emoji: '🔥', label: 'Fireplace',     x: 62, y: 25, size: 50, animType: 'pulse',  speech: 'The fireplace keeps everyone warm and cosy!',          reaction: '🌡️', isHelper: false, helperStars: 0,
        toggle: { on: '🔥', off: '🧊', speechOn: 'Fire on! So warm and cosy!', speechOff: 'Fire off. Nice and cool now!' } },
      { id: 'cozy-lamp',     emoji: '💡', label: 'Lamp',          x: 88, y: 55, size: 38, animType: 'pulse',  speech: 'Soft lamplight for a cosy evening!',                  reaction: '✨', isHelper: false, helperStars: 0,
        toggle: { on: '💡', off: '🔦', speechOn: 'Lamp on! Soft and cosy glow!', speechOff: 'Lamp off. Time to sleep soon!' } },
      { id: 'cat-sofa',      emoji: '🐱', label: 'Lazy Cat',      x: 50, y: 72, size: 34, animType: 'bounce', speech: 'The cat is so cosy on the sofa! Purrrr!',             reaction: '🐱', isHelper: false, helperStars: 0 },
      { id: 'remote',        emoji: '📱', label: 'Remote',        x: 25, y: 68, size: 32, animType: 'wiggle', speech: "Where's the remote? Ah, found it!",                   reaction: '📺', isHelper: false, helperStars: 0 },
    ],
  },
];
