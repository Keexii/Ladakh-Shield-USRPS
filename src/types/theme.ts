export type ThemeId = 'dark' | 'light' | 'defence-dark' | 'arctic-light';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  subtitle: string;
  tagline: string;
  category: 'dark' | 'light';
  previewColors: {
    bg: string;
    card: string;
    accent: string;
    border: string;
  };
}

export const AVAILABLE_THEMES: ThemeDefinition[] = [
  {
    id: 'dark',
    name: 'DARK THEME',
    subtitle: 'High-Altitude Military-Tech',
    tagline: 'LADAKH-SHIELD Military-Tech (Deep Navy #07111F + Ice Cyan #00D9FF + Safety Green #00FF9C)',
    category: 'dark',
    previewColors: {
      bg: '#07111F',
      card: '#12263A',
      accent: '#00D9FF',
      border: '#1E4055'
    }
  },
  {
    id: 'light',
    name: 'LIGHT THEME',
    subtitle: 'Arctic Snow & High Visibility',
    tagline: 'High-Altitude Arctic Snow (Pure White #FFFFFF + Sky Cyan #0284C7 + Signal Green #059669)',
    category: 'light',
    previewColors: {
      bg: '#F1F5F9',
      card: '#FFFFFF',
      accent: '#0284C7',
      border: '#CBD5E1'
    }
  }
];
