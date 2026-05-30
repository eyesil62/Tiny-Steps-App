export interface Sticker { id: string; emoji: string; name: string; pageId: string; }
export interface ToyItem  { id: string; emoji: string; name: string; pageId: string; shelf: string; }

export const STICKERS: Sticker[] = [
  { id: 'dog-sticker',       emoji: '🐶', name: 'Dog Sticker',       pageId: 'dog'        },
  { id: 'cat-sticker',       emoji: '🐱', name: 'Cat Sticker',       pageId: 'cat'        },
  { id: 'lion-sticker',      emoji: '🦁', name: 'Lion Sticker',      pageId: 'lion'       },
  { id: 'firetruck-sticker', emoji: '🚒', name: 'Fire Truck Sticker',pageId: 'fire-truck' },
  { id: 'rocket-sticker',    emoji: '🚀', name: 'Rocket Sticker',    pageId: 'rocket'     },
  { id: 'bus-sticker',       emoji: '🚌', name: 'Bus Sticker',       pageId: 'school-bus' },
  { id: 'trex-sticker',      emoji: '🦖', name: 'T-Rex Sticker',     pageId: 'trex'       },
  { id: 'dolphin-sticker',   emoji: '🐬', name: 'Dolphin Sticker',   pageId: 'dolphin'    },
  { id: 'planet-sticker',    emoji: '🪐', name: 'Planet Sticker',    pageId: 'planet'     },
  { id: 'pizza-sticker',     emoji: '🍕', name: 'Pizza Sticker',     pageId: 'pizza'      },
  { id: 'icecream-sticker',  emoji: '🍦', name: 'Ice Cream Sticker', pageId: 'ice-cream'  },
];

export const TOYS: ToyItem[] = [
  { id: 'dog-toy',       emoji: '🐶', name: 'Dog Toy',       pageId: 'dog',        shelf: 'animals'  },
  { id: 'cat-toy',       emoji: '🐱', name: 'Cat Toy',       pageId: 'cat',        shelf: 'animals'  },
  { id: 'lion-toy',      emoji: '🦁', name: 'Lion Toy',      pageId: 'lion',       shelf: 'animals'  },
  { id: 'firetruck-toy', emoji: '🚒', name: 'Fire Truck',    pageId: 'fire-truck', shelf: 'vehicles' },
  { id: 'rocket-toy',    emoji: '🚀', name: 'Rocket',        pageId: 'rocket',     shelf: 'vehicles' },
  { id: 'bus-toy',       emoji: '🚌', name: 'School Bus',    pageId: 'school-bus', shelf: 'vehicles' },
  { id: 'trex-toy',      emoji: '🦖', name: 'T-Rex Toy',     pageId: 'trex',       shelf: 'dinos'    },
  { id: 'dolphin-toy',   emoji: '🐬', name: 'Dolphin Toy',   pageId: 'dolphin',    shelf: 'ocean'    },
  { id: 'planet-toy',    emoji: '🪐', name: 'Planet Model',  pageId: 'planet',     shelf: 'space'    },
  { id: 'pizza-toy',     emoji: '🍕', name: 'Play Pizza',    pageId: 'pizza',      shelf: 'food'     },
  { id: 'icecream-toy',  emoji: '🍦', name: 'Ice Cream Toy', pageId: 'ice-cream',  shelf: 'food'     },
];

export const ARTIST_LEVELS = [
  { level: 1, title: 'Tiny Artist',   emoji: '🖍️', minPages: 0  },
  { level: 2, title: 'Bronze Artist', emoji: '🥉', minPages: 3  },
  { level: 3, title: 'Silver Artist', emoji: '🥈', minPages: 10 },
  { level: 4, title: 'Gold Artist',   emoji: '🥇', minPages: 25 },
  { level: 5, title: 'Master Artist', emoji: '👑', minPages: 50 },
];

export function getArtistLevel(completed: number) {
  return [...ARTIST_LEVELS].reverse().find(l => completed >= l.minPages) ?? ARTIST_LEVELS[0];
}

export const MYSTERY_PAINTS = [
  { id: 'mp-rainbow', emoji: '🌈', name: 'Rainbow Paint',  unlockAt: 3  },
  { id: 'mp-galaxy',  emoji: '🌌', name: 'Galaxy Paint',   unlockAt: 7  },
  { id: 'mp-gold',    emoji: '✨', name: 'Gold Paint',     unlockAt: 12 },
  { id: 'mp-snow',    emoji: '❄️', name: 'Snow Paint',     unlockAt: 18 },
];
