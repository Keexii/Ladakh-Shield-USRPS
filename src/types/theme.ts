export type ThemeId = 'night' | 'day' | 'dark' | 'light' | 'defence-dark' | 'arctic-light';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  subtitle: string;
  tagline: string;
  category: 'night' | 'day' | 'dark' | 'light';
  previewColors: {
    bg: string;
    card: string;
    accent: string;
    border: string;
  };
}

export const AVAILABLE_THEMES: ThemeDefinition[] = [
  {
    id: 'night',
    name: 'NIGHT THEME',
    subtitle: 'Tactical Night Operations',
    tagline: 'Deep Navy (#07111F) + Ice Cyan (#00D9FF) + Safety Green (#00FF9C) for low-light night-ops and tactical clarity',
    category: 'night',
    previewColors: {
      bg: '#07111F',
      card: '#12263A',
      accent: '#00D9FF',
      border: '#1E4055'
    }
  },
  {
    id: 'day',
    name: 'DAY THEME',
    subtitle: 'Arctic Snow & High Daylight Visibility',
    tagline: 'Crisp Arctic Snow (#F1F5F9) + Pure White (#FFFFFF) + Sky Cyan (#0284C7) for high-glare daytime operations',
    category: 'day',
    previewColors: {
      bg: '#F1F5F9',
      card: '#FFFFFF',
      accent: '#0284C7',
      border: '#CBD5E1'
    }
  }
];
