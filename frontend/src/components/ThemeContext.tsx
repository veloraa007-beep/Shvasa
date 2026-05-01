'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = {
  theme_name: string;
  background_primary: string;
  background_secondary: string;
  accent_primary: string;
  accent_secondary: string;
  text_primary: string;
  text_secondary: string;
  border_color: string;
  priority_high: string;
  priority_medium: string;
  priority_low: string;
  nature_metaphor: string;
}

const defaultTheme: Theme = {
  theme_name: 'sunflower',
  background_primary: '#FDFAF4',
  background_secondary: '#F5EDD8',
  accent_primary: '#2D5A27',
  accent_secondary: '#4A8C3F',
  text_primary: '#5C3D1E',
  text_secondary: '#3A5C35',
  border_color: 'rgba(58, 92, 53, 0.1)',
  priority_high: '#E8A000',
  priority_medium: '#5BA4CF',
  priority_low: '#7DBF6E',
  nature_metaphor: 'A warm meadow at dawn'
};

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>({ theme: defaultTheme, setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--mist', theme.background_primary);
    root.style.setProperty('--earth', theme.background_secondary);
    root.style.setProperty('--forest', theme.accent_primary);
    root.style.setProperty('--leaf', theme.accent_secondary);
    root.style.setProperty('--bark', theme.text_primary);
    root.style.setProperty('--bark-mid', theme.text_secondary);
    root.style.setProperty('--gold', theme.priority_high);
    root.style.setProperty('--medium', theme.priority_medium);
    root.style.setProperty('--leaf-light', theme.priority_low);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div style={{ 
        '--forest': theme.accent_primary,
        '--leaf': theme.accent_secondary,
        '--gold': theme.priority_high,
        '--bark': theme.text_primary,
        '--mist': theme.background_primary,
        '--earth': theme.background_secondary,
      } as React.CSSProperties}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
