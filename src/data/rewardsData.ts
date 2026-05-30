export interface Badge {
  id:          string;
  emoji:       string;
  title:       string;
  description: string;
  color:       string;
  colorLight:  string;
  requirement: number; // stars needed
  category:    'learning' | 'games' | 'habits' | 'stories' | 'special';
}

export const BADGES: Badge[] = [
  // Learning badges
  { id: 'first-lesson',    emoji: '📚', title: 'First Steps',      description: 'Completed your first lesson!',       color: '#4D96FF', colorLight: '#E5EFFE', requirement: 5,   category: 'learning' },
  { id: 'alphabet-master', emoji: '🔤', title: 'Alphabet Master',  description: 'Learned all 26 letters!',            color: '#4D96FF', colorLight: '#E5EFFE', requirement: 30,  category: 'learning' },
  { id: 'number-wizard',   emoji: '🔢', title: 'Number Wizard',    description: 'Mastered numbers 1–10!',             color: '#4D96FF', colorLight: '#E5EFFE', requirement: 20,  category: 'learning' },
  { id: 'color-expert',    emoji: '🎨', title: 'Color Expert',     description: 'Knows all the colors!',              color: '#C77DFF', colorLight: '#F3E5FF', requirement: 15,  category: 'learning' },
  { id: 'bookworm',        emoji: '🐛', title: 'Bookworm',         description: 'Completed 5 learning modules!',      color: '#4D96FF', colorLight: '#E5EFFE', requirement: 75,  category: 'learning' },
  // Game badges
  { id: 'first-game',      emoji: '🎮', title: 'Game On!',         description: 'Played your first game!',            color: '#FF6B6B', colorLight: '#FFE5E5', requirement: 3,   category: 'games'    },
  { id: 'balloon-champ',   emoji: '🎈', title: 'Balloon Champ',    description: 'Won Balloon Pop 3 times!',           color: '#FF6B6B', colorLight: '#FFE5E5', requirement: 25,  category: 'games'    },
  { id: 'animal-expert',   emoji: '🦁', title: 'Animal Expert',    description: 'Aced Animal Sounds!',                color: '#6BCB77', colorLight: '#E5F7E7', requirement: 20,  category: 'games'    },
  { id: 'math-star',       emoji: '⭐', title: 'Math Star',        description: 'Counted perfectly 5 times!',         color: '#FF9F43', colorLight: '#FFF0DC', requirement: 35,  category: 'games'    },
  // Habit badges
  { id: 'first-habit',     emoji: '💪', title: 'Good Start!',      description: 'Completed your first habit!',        color: '#FFD93D', colorLight: '#FFF8DC', requirement: 2,   category: 'habits'   },
  { id: 'streak-3',        emoji: '🔥', title: '3 Day Streak!',    description: 'Habits 3 days in a row!',            color: '#FF9F43', colorLight: '#FFF0DC', requirement: 10,  category: 'habits'   },
  { id: 'streak-7',        emoji: '🏅', title: 'Week Champion!',   description: 'Habits 7 days in a row!',            color: '#FFD93D', colorLight: '#FFF8DC', requirement: 30,  category: 'habits'   },
  { id: 'streak-30',       emoji: '🏆', title: 'Monthly Hero!',    description: 'Amazing 30 day streak!',             color: '#C77DFF', colorLight: '#F3E5FF', requirement: 100, category: 'habits'   },
  { id: 'all-habits',      emoji: '✅', title: 'Perfect Day!',     description: 'All habits done in one day!',        color: '#6BCB77', colorLight: '#E5F7E7', requirement: 16,  category: 'habits'   },
  // Story badges
  { id: 'first-story',     emoji: '📖', title: 'Story Starter',    description: 'Read your first story!',             color: '#C77DFF', colorLight: '#F3E5FF', requirement: 3,   category: 'stories'  },
  { id: 'bedtime-reader',  emoji: '🌙', title: 'Bedtime Reader',   description: 'Read a bedtime story!',              color: '#1a1040', colorLight: '#E8E5F7', requirement: 3,   category: 'stories'  },
  { id: 'bookclub',        emoji: '📚', title: 'Book Club Star',   description: 'Read 5 stories!',                    color: '#C77DFF', colorLight: '#F3E5FF', requirement: 50,  category: 'stories'  },
  // Special badges
  { id: 'first-day',       emoji: '🌟', title: 'Welcome!',         description: 'First day in TinySteps!',            color: '#FF6B6B', colorLight: '#FFE5E5', requirement: 0,   category: 'special'  },
  { id: 'superstar',       emoji: '🦸', title: 'Superstar!',       description: 'Earned 100 stars!',                  color: '#FFD93D', colorLight: '#FFF8DC', requirement: 100, category: 'special'  },
  { id: 'champion',        emoji: '👑', title: 'Champion!',        description: 'Earned 250 stars!',                  color: '#FF9F43', colorLight: '#FFF0DC', requirement: 250, category: 'special'  },
];

export const LEVELS = [
  { level: 1, title: 'Tiny Seed',      emoji: '🌱', minStars: 0,   color: '#6BCB77' },
  { level: 2, title: 'Little Sprout',  emoji: '🌿', minStars: 25,  color: '#4D96FF' },
  { level: 3, title: 'Growing Star',   emoji: '⭐', minStars: 75,  color: '#FFD93D' },
  { level: 4, title: 'Brave Explorer', emoji: '🗺️', minStars: 150, color: '#FF9F43' },
  { level: 5, title: 'Super Champion', emoji: '🏆', minStars: 300, color: '#C77DFF' },
];

export function getCurrentLevel(stars: number) {
  return [...LEVELS].reverse().find(l => stars >= l.minStars) ?? LEVELS[0];
}

export function getNextLevel(stars: number) {
  return LEVELS.find(l => l.minStars > stars);
}

export function getEarnedBadges(stars: number, completedCategories: string[]): Badge[] {
  return BADGES.filter(b => b.requirement <= stars);
}
