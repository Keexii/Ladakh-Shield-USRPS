import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeId, ThemeDefinition, AVAILABLE_THEMES } from '../types/theme';

interface ThemeContextType {
  currentTheme: ThemeId;
  themeDefinition: ThemeDefinition;
  setTheme: (themeId: ThemeId) => void;
  toggleTheme: () => void;
  setDayMode: () => void;
  setNightMode: () => void;
  isNight: boolean;
  isDay: boolean;
  isDark: boolean;
  availableThemes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('ladakh_shield_theme');
    if (saved === 'day' || saved === 'light' || saved === 'arctic-light') {
      return 'day';
    }
    return 'night';
  });

  const normalizedThemeId: 'night' | 'day' = 
    (currentTheme === 'day' || currentTheme === 'light' || currentTheme === 'arctic-light') 
      ? 'day' 
      : 'night';

  const themeDefinition = AVAILABLE_THEMES.find(t => t.id === normalizedThemeId) || AVAILABLE_THEMES[0];
  const isNight = normalizedThemeId === 'night';
  const isDay = !isNight;
  const isDark = isNight;

  const toggleTheme = () => {
    setCurrentTheme(prev => 
      (prev === 'day' || prev === 'light' || prev === 'arctic-light') ? 'night' : 'day'
    );
  };

  const setDayMode = () => setCurrentTheme('day');
  const setNightMode = () => setCurrentTheme('night');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      'theme-night',
      'theme-day',
      'theme-dark', 
      'theme-light', 
      'theme-defence-dark', 
      'theme-arctic-light', 
      'theme-tactical-green', 
      'theme-midnight-blue', 
      'theme-high-contrast',
      'night',
      'day',
      'dark',
      'light'
    );

    if (isNight) {
      root.classList.add('theme-night', 'theme-dark', 'night', 'dark');
      root.setAttribute('data-theme', 'night');
      root.setAttribute('data-theme-mode', 'night');
    } else {
      root.classList.add('theme-day', 'theme-light', 'day', 'light');
      root.setAttribute('data-theme', 'day');
      root.setAttribute('data-theme-mode', 'day');
    }

    if (document.body) {
      document.body.classList.remove('theme-night', 'theme-day', 'theme-dark', 'theme-light', 'night', 'day', 'dark', 'light');
      if (isNight) {
        document.body.classList.add('theme-night', 'theme-dark', 'night', 'dark');
        document.body.setAttribute('data-theme', 'night');
      } else {
        document.body.classList.add('theme-day', 'theme-light', 'day', 'light');
        document.body.setAttribute('data-theme', 'day');
      }
    }

    try {
      localStorage.setItem('ladakh_shield_theme', normalizedThemeId);
    } catch (e) {
      console.warn('Failed to save theme in localStorage', e);
    }
  }, [currentTheme, normalizedThemeId, isNight]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme: normalizedThemeId,
        themeDefinition,
        setTheme: setCurrentTheme,
        toggleTheme,
        setDayMode,
        setNightMode,
        isNight,
        isDay,
        isDark,
        availableThemes: AVAILABLE_THEMES
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
