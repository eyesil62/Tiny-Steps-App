// ============================================================
// Happy Pet Home — Daily Reward System
// No guilt, no punishment — just gentle encouragement
// ============================================================

export interface DailyState {
  lastPlayed:   string | null; // ISO date string
  streak:       number;
  todayActions: string[];      // actions done today
  totalStars:   number;
}

export function getDayKey(date = new Date()): string {
  return date.toDateString();
}

export function isNewDay(lastPlayed: string | null): boolean {
  if (!lastPlayed) return true;
  return lastPlayed !== getDayKey();
}

export function calculateStreak(lastPlayed: string | null, currentStreak: number): number {
  if (!lastPlayed) return 1;
  const last = new Date(lastPlayed);
  const now  = new Date();
  const daysDiff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) return currentStreak; // same day
  if (daysDiff === 1) return currentStreak + 1; // consecutive
  return 1; // missed days — reset gently (no punishment)
}

export function getStreakReward(streak: number): { emoji: string; message: string; stars: number } | null {
  if (streak === 3)  return { emoji: '🎀', message: '3 day streak! You got a new toy!',        stars: 5  };
  if (streak === 7)  return { emoji: '🛋️', message: '7 day streak! New room item unlocked!',  stars: 10 };
  if (streak === 14) return { emoji: '👑', message: '2 week streak! You\'re a star caregiver!', stars: 20 };
  if (streak === 30) return { emoji: '🏆', message: '30 day streak! CHAMPION caregiver!',      stars: 50 };
  return null;
}

export function getDailyGreeting(petName: string, isReturn: boolean): string {
  if (!isReturn) return `Hello! ${petName} is ready to play!`;
  const messages = [
    `${petName} missed you so much! 💕`,
    `Yay! ${petName} is so happy you're back!`,
    `${petName} was waiting for you! 🌟`,
    `Welcome back! ${petName} has been dreaming of you!`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getHoursElapsed(lastPlayed: string | null): number {
  if (!lastPlayed) return 0;
  const diff = Date.now() - new Date(lastPlayed).getTime();
  return Math.min(24, Math.floor(diff / (1000 * 60 * 60)));
}
