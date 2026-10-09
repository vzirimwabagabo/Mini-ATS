import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTheme } from '../types';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'mini_ats_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme;
    return saved === 'dark' || saved === 'midnight' || saved === 'light' ? saved : 'light';
  });

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
    localStorage.setItem(THEME_STORAGE_KEY, t);
    applyThemeClass(t);
  };

  const toggleTheme = () => {
    const next: AppTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'midnight' : 'light';
    setTheme(next);
  };

  const applyThemeClass = (t: AppTheme) => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-midnight', 'dark');
    if (t === 'dark') {
      root.classList.add('dark', 'theme-dark');
    } else if (t === 'midnight') {
      root.classList.add('dark', 'theme-midnight');
    } else {
      root.classList.add('theme-light');
    }
  };

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
