// ============================================================
// Milo's Busy Day — Mission Definitions
// Each step.objects[] contains obj.id values from rooms.ts.
// An object is a mission target if its id is in this array —
// no isMissionItem / missionStep coupling needed.
// ============================================================

export interface MissionStep {
  id:      string;
  label:   string;
  emoji:   string;
  room:    string;
  objects: string[]; // obj.id values that must be tapped to complete this step
  speech:  string;
}

export interface Mission {
  id:          string;
  title:       string;
  emoji:       string;
  description: string;
  color:       string;
  badge:       string;  // badge emoji awarded on first completion
  unlockAt:    number;  // minimum totalStars required to play
  steps:       MissionStep[];
}

export const MISSIONS: Mission[] = [

  // ── 1. SCHOOL MORNING ─────────────────────────────────────
  {
    id: 'school-morning',
    title: 'School Morning!',
    emoji: '🏫',
    description: 'Help Milo get ready for school!',
    color: '#FF9F43',
    badge: '🏫',
    unlockAt: 0,
    steps: [
      {
        id: 'wake-up',
        label: 'Wake Up',
        emoji: '⏰',
        room: 'bedroom',
        objects: ['alarm', 'curtains'],
        speech: 'Time to wake up! Stop the alarm and open the curtains!',
      },
      {
        id: 'get-dressed',
        label: 'Get Dressed',
        emoji: '👕',
        room: 'bedroom',
        objects: ['closet', 'pyjamas'],
        speech: 'Choose an outfit from the closet and put the pyjamas away!',
      },
      {
        id: 'brush-teeth',
        label: 'Brush Teeth',
        emoji: '🦷',
        room: 'bathroom',
        objects: ['toothpaste', 'brush-top', 'brush-bot', 'rinse'],
        speech: "Let's brush those teeth until they sparkle!",
      },
      {
        id: 'breakfast',
        label: 'Eat Breakfast',
        emoji: '🥣',
        room: 'kitchen',
        objects: ['cereal', 'milk', 'fruit', 'eat-bowl', 'plate'],
        speech: 'Time for a healthy and delicious breakfast!',
      },
      {
        id: 'pack-bag',
        label: 'Pack School Bag',
        emoji: '🎒',
        room: 'schoolbag',
        objects: ['book-bag', 'pencil', 'lunchbox', 'waterbottle'],
        speech: 'Pack everything you need for school today!',
      },
    ],
  },

  // ── 2. BIG CLEAN UP ───────────────────────────────────────
  {
    id: 'big-clean-up',
    title: 'Big Clean Up!',
    emoji: '🧹',
    description: 'Help Milo tidy the whole house!',
    color: '#6BCB77',
    badge: '🧹',
    unlockAt: 0,
    steps: [
      {
        id: 'clean-bedroom',
        label: 'Tidy Bedroom',
        emoji: '🛏️',
        room: 'bedroom',
        objects: ['bed', 'laundry'],
        speech: 'Make the bed and put the dirty clothes in the laundry!',
      },
      {
        id: 'clean-bathroom',
        label: 'Tidy Bathroom',
        emoji: '🛁',
        room: 'bathroom',
        objects: ['soap', 'towel', 'handsoap'],
        speech: 'Tidy the bathroom — hang the towel and use the soap!',
      },
      {
        id: 'clean-kitchen',
        label: 'Clean Kitchen',
        emoji: '🍳',
        room: 'kitchen',
        objects: ['plate', 'spill', 'water'],
        speech: 'Clean the kitchen — wipe spills and put dishes away!',
      },
      {
        id: 'clean-playroom',
        label: 'Tidy Playroom',
        emoji: '🎮',
        room: 'playroom',
        objects: ['toy-box', 'bookshelf', 'crayons', 'blocks'],
        speech: 'Put everything away in the playroom — let\'s make it shine!',
      },
    ],
  },

  // ── 3. WEEKEND FUN ────────────────────────────────────────
  {
    id: 'weekend-fun',
    title: 'Weekend Fun!',
    emoji: '🌳',
    description: 'Enjoy a fun weekend day with Milo!',
    color: '#4D96FF',
    badge: '🌳',
    unlockAt: 5,
    steps: [
      {
        id: 'garden-morning',
        label: 'Garden Time',
        emoji: '🌻',
        room: 'garden',
        objects: ['watering-can', 'flower-pot', 'bird-feeder'],
        speech: "It's a beautiful day! Let's take care of the garden first!",
      },
      {
        id: 'garden-snack',
        label: 'Snack Break',
        emoji: '🍓',
        room: 'kitchen',
        objects: ['fruit', 'water', 'eat-bowl'],
        speech: "After all that gardening, let's have a healthy snack!",
      },
      {
        id: 'playtime',
        label: 'Playtime!',
        emoji: '🧩',
        room: 'playroom',
        objects: ['crayons', 'toy-car', 'puzzle'],
        speech: "Now for the best part — free play! What shall we do first?",
      },
    ],
  },

  // ── 4. BEDTIME ROUTINE ────────────────────────────────────
  {
    id: 'bedtime-routine',
    title: 'Bedtime Routine',
    emoji: '🌙',
    description: "Help Milo wind down for a good night's sleep!",
    color: '#C77DFF',
    badge: '🌙',
    unlockAt: 10,
    steps: [
      {
        id: 'evening-tidy',
        label: 'Evening Tidy',
        emoji: '🍽️',
        room: 'kitchen',
        objects: ['pet-bowl', 'plate', 'water'],
        speech: "Let's feed the pet and tidy up after dinner!",
      },
      {
        id: 'night-brush',
        label: 'Clean Teeth',
        emoji: '🦷',
        room: 'bathroom',
        objects: ['toothpaste', 'brush-top', 'brush-bot', 'rinse'],
        speech: 'Clean those teeth before bed for sweet dreams!',
      },
      {
        id: 'tuck-in',
        label: 'Tuck In',
        emoji: '🌙',
        room: 'bedroom',
        objects: ['pyjamas', 'toy-bear', 'lamp'],
        speech: 'Put on pyjamas, find Teddy, and switch off the lamp!',
      },
    ],
  },

  // ── 5. AFTER SCHOOL ───────────────────────────────────────
  {
    id: 'after-school',
    title: 'After School!',
    emoji: '📚',
    description: 'Help Milo unwind and get ready for tomorrow!',
    color: '#FF6B6B',
    badge: '📚',
    unlockAt: 15,
    steps: [
      {
        id: 'after-snack',
        label: 'Healthy Snack',
        emoji: '🍓',
        room: 'kitchen',
        objects: ['fruit', 'water', 'milk'],
        speech: "School was great! Time for a healthy after-school snack!",
      },
      {
        id: 'unpack-bag',
        label: 'Unpack Bag',
        emoji: '🎒',
        room: 'schoolbag',
        objects: ['book-bag', 'pencil', 'backpack'],
        speech: "Let's unpack the school bag and get everything sorted!",
      },
      {
        id: 'free-play',
        label: 'Free Play!',
        emoji: '🚗',
        room: 'playroom',
        objects: ['toy-car', 'puzzle', 'stuffed'],
        speech: "Homework done! Now let's play and have some fun!",
      },
    ],
  },

  // ── 6. GARDEN ADVENTURE ───────────────────────────────────
  {
    id: 'garden-adventure',
    title: 'Garden Adventure!',
    emoji: '🌻',
    description: 'A full day exploring and tending the garden!',
    color: '#81C784',
    badge: '🌻',
    unlockAt: 20,
    steps: [
      {
        id: 'big-garden',
        label: 'Tend the Garden',
        emoji: '🌻',
        room: 'garden',
        objects: ['watering-can', 'flower-pot', 'bird-feeder', 'veggie-patch'],
        speech: "It's a garden adventure day! Let's look after everything!",
      },
      {
        id: 'harvest-snack',
        label: 'Garden Snack',
        emoji: '🥕',
        room: 'kitchen',
        objects: ['fruit', 'water', 'pet-bowl'],
        speech: "The veggies we grew taste amazing! Let's make a snack!",
      },
      {
        id: 'garden-craft',
        label: 'Nature Crafts',
        emoji: '🎨',
        room: 'playroom',
        objects: ['bookshelf', 'crayons', 'blocks'],
        speech: 'Draw pictures of the garden and build something amazing!',
      },
    ],
  },

  // ── 7. FAMILY DINNER NIGHT ────────────────────────────────
  {
    id: 'family-dinner',
    title: 'Family Dinner Night!',
    emoji: '🍽️',
    description: 'Help Milo prepare a wonderful family dinner!',
    color: '#FF9F43',
    badge: '🍽️',
    unlockAt: 25,
    steps: [
      {
        id: 'cook-dinner',
        label: 'Make Dinner',
        emoji: '🍳',
        room: 'kitchen',
        objects: ['cereal', 'milk', 'fruit', 'eat-bowl', 'plate', 'water'],
        speech: "It's family dinner night! Let's cook something delicious!",
      },
      {
        id: 'set-table',
        label: 'Set the Table',
        emoji: '🍽️',
        room: 'living-room',
        objects: ['dining-table', 'family-plates', 'water-jug', 'bread-basket'],
        speech: "Let's set the table perfectly for the whole family!",
      },
    ],
  },
];

export const getDailyMission = (): Mission => {
  const dayOfMonth = new Date().getDate();
  const index = (dayOfMonth - 1) % MISSIONS.length;
  return MISSIONS[index];
};
