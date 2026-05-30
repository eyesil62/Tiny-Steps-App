// ============================================================
// Happy Pet Home — Pet Needs Logic
// ============================================================

export interface PetNeeds {
  hunger:      number; // 0-100, 100 = full
  cleanliness: number; // 0-100, 100 = clean
  happiness:   number; // 0-100, 100 = happy
  energy:      number; // 0-100, 100 = rested
}

export type NeedKey = keyof PetNeeds;

export const DEFAULT_NEEDS: PetNeeds = {
  hunger:      70,
  cleanliness: 80,
  happiness:   75,
  energy:      80,
};

// Decay per "session" (called when app opens after time away)
const HOURLY_DECAY = {
  hunger:      8,
  cleanliness: 4,
  happiness:   5,
  energy:      3,
};

export function decayNeeds(needs: PetNeeds, hoursElapsed: number): PetNeeds {
  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  return {
    hunger:      clamp(needs.hunger      - HOURLY_DECAY.hunger      * hoursElapsed),
    cleanliness: clamp(needs.cleanliness - HOURLY_DECAY.cleanliness * hoursElapsed),
    happiness:   clamp(needs.happiness   - HOURLY_DECAY.happiness   * hoursElapsed),
    energy:      clamp(needs.energy      - HOURLY_DECAY.energy      * hoursElapsed),
  };
}

// Returns overall mood 0-100
export function getMood(needs: PetNeeds): number {
  return Math.round(
    (needs.hunger + needs.cleanliness + needs.happiness + needs.energy) / 4
  );
}

export function getMoodEmoji(mood: number): string {
  if (mood >= 85) return '😄';
  if (mood >= 70) return '😊';
  if (mood >= 50) return '😐';
  if (mood >= 30) return '😟';
  return '😢';
}

export function getMoodLabel(mood: number): string {
  if (mood >= 85) return 'Overjoyed!';
  if (mood >= 70) return 'Happy';
  if (mood >= 50) return 'Okay';
  if (mood >= 30) return 'Sad';
  return 'Very sad...';
}

export function getUrgentNeed(needs: PetNeeds): NeedKey | null {
  const entries = Object.entries(needs) as [NeedKey, number][];
  const urgent  = entries.find(([, v]) => v < 25);
  return urgent?.[0] ?? null;
}

export function getNeedColor(value: number): string {
  if (value >= 70) return '#6BCB77';
  if (value >= 40) return '#FFD93D';
  return '#FF6B6B';
}

export function getNeedEmoji(key: NeedKey): string {
  switch (key) {
    case 'hunger':      return '🍖';
    case 'cleanliness': return '🛁';
    case 'happiness':   return '😊';
    case 'energy':      return '⚡';
  }
}

export function getNeedLabel(key: NeedKey): string {
  switch (key) {
    case 'hunger':      return 'Hunger';
    case 'cleanliness': return 'Clean';
    case 'happiness':   return 'Happy';
    case 'energy':      return 'Energy';
  }
}
