export type AgeGroup = '2-4' | '5-7' | '8-10';
export type Language = 'en' | 'ar' | 'es' | 'fr' | 'de' | 'tr' | 'pt';
export type AppTheme = 'light' | 'dark' | 'system';

export interface ChildProfile {
  id: string;
  user_id: string;
  name: string;
  age_group: AgeGroup;
  avatar_id: string;
  language: Language;
  theme_color: string;
  created_at: string;
}

export interface AppSettings {
  language: Language;
  theme: AppTheme;
  sound_enabled: boolean;
  music_enabled: boolean;
  notifications_enabled: boolean;
}
