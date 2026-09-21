import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeId, ThemeDefinition, AVAILABLE_THEMES } from '../types/theme';

interface ThemeContextType {
  currentTheme: ThemeId;
  themeDefinition: ThemeDefinition;
  setTheme: (themeId: ThemeId) => void;
  toggleTheme: () => void;
  isDark: boolean;
  availableThemes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('ladakh_shield_theme');
    if (saved === 'light' || saved === 'arctic-light') {
      return 'light';
    }
    return 'dark';
  });

  const normalizedThemeId = (currentTheme === 'light' || currentTheme === 'arctic-light') ? 'light' : 'dark';
  const themeDefinition = AVAILABLE_THEMES.find(t => t.id === normalizedThemeId) || AVAILABLE_THEMES[0];
  const isDark = normalizedThemeId === 'dark';

  const toggleTheme = () => {
    setCurrentTheme(prev => (prev === 'light' || prev === 'arctic-light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      'theme-dark', 
      'theme-light', 
      'theme-defence-dark', 
      'theme-arctic-light', 
      'theme-tactical-green', 
      'theme-midnight-blue', 
      'theme-high-contrast',
      'dark',
      'light'
    );
    root.classList.add('theme-' + normalizedThemeId);
    root.classList.add(normalizedThemeId);
    root.setAttribute('data-theme', normalizedThemeId);

    if (document.body) {
      document.body.classList.remove('theme-dark', 'theme-light', 'dark', 'light');
      document.body.classList.add('theme-' + normalizedThemeId);
      document.body.classList.add(normalizedThemeId);
      document.body.setAttribute('data-theme', normalizedThemeId);
    }

    try {
      localStorage.setItem('ladakh_shield_theme', normalizedThemeId);
    } catch (e) {
      console.warn('Failed to save theme in localStorage', e);
    }
  }, [currentTheme, normalizedThemeId]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme: normalizedThemeId,
        themeDefinition,
        setTheme: setCurrentTheme,
        toggleTheme,
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
