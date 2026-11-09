import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeType, WallpaperType } from '../types';
import { StorageManager } from './storage';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  wallpaper: WallpaperType;
  setWallpaper: (w: WallpaperType) => void;
  themeConfig: {
    name: string;
    description: string;
    primaryColor: string;
    bgClass: string;
    cardBg: string;
    borderClass: string;
    accentClass: string;
    textClass: string;
    badgeBg: string;
  };
}

export const THEME_CONFIGS: Record<ThemeType, {
  name: string;
  description: string;
  primaryColor: string;
  bgClass: string;
  cardBg: string;
  borderClass: string;
  accentClass: string;
  textClass: string;
  badgeBg: string;
}> = {
  mint: {
    name: 'Mint Green',
    description: 'Fresh botanical pastel, energizing & crisp',
    primaryColor: '#10b981',
    bgClass: 'bg-emerald-950/20 text-slate-100',
    cardBg: 'bg-slate-900/80',
    borderClass: 'border-emerald-500/20',
    accentClass: 'from-emerald-500 to-teal-400 text-white',
    textClass: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  lavender: {
    name: 'Lavender Whisper',
    description: 'Calming lilac & soft purple harmony',
    primaryColor: '#a855f7',
    bgClass: 'bg-purple-950/20 text-slate-100',
    cardBg: 'bg-slate-900/80',
    borderClass: 'border-purple-500/20',
    accentClass: 'from-purple-500 to-indigo-400 text-white',
    textClass: 'text-purple-400',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  peach: {
    name: 'Warm Peach',
    description: 'Cozy apricot and gentle sunny coral',
    primaryColor: '#f97316',
    bgClass: 'bg-orange-950/20 text-slate-100',
    cardBg: 'bg-slate-900/80',
    borderClass: 'border-orange-500/20',
    accentClass: 'from-orange-500 to-amber-400 text-white',
    textClass: 'text-orange-400',
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  },
  skyblue: {
    name: 'Sky Blue',
    description: 'Airy serene blues and cloud-like clarity',
    primaryColor: '#0ea5e9',
    bgClass: 'bg-sky-950/20 text-slate-100',
    cardBg: 'bg-slate-900/80',
    borderClass: 'border-sky-500/20',
    accentClass: 'from-sky-500 to-cyan-400 text-white',
    textClass: 'text-sky-400',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  },
  sunset: {
    name: 'Sunset Glow',
    description: 'Vibrant golden hour pinks and warm amber',
    primaryColor: '#f43f5e',
    bgClass: 'bg-rose-950/20 text-slate-100',
    cardBg: 'bg-slate-900/80',
    borderClass: 'border-rose-500/20',
    accentClass: 'from-rose-500 to-amber-500 text-white',
    textClass: 'text-rose-400',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
  ghibli: {
    name: 'Ghibli-Inspired Meadow',
    description: 'Whimsical green hills, wild blossom pastels',
    primaryColor: '#34d399',
    bgClass: 'bg-teal-950/30 text-slate-100',
    cardBg: 'bg-slate-900/85',
    borderClass: 'border-teal-500/25',
    accentClass: 'from-teal-400 via-emerald-400 to-amber-300 text-slate-950 font-bold',
    textClass: 'text-teal-300',
    badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  },
  dark: {
    name: 'Deep Midnight Dark',
    description: 'Focused obsidian night with neon accents',
    primaryColor: '#6366f1',
    bgClass: 'bg-slate-950 text-slate-100',
    cardBg: 'bg-slate-900/90',
    borderClass: 'border-slate-800',
    accentClass: 'from-indigo-600 to-violet-600 text-white',
    textClass: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => StorageManager.getTheme());
  const [wallpaper, setWallpaperState] = useState<WallpaperType>(() => StorageManager.getWallpaper());

  const setTheme = (t: ThemeType) => {
    setThemeState(t);
    StorageManager.setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
  };

  const setWallpaper = (w: WallpaperType) => {
    setWallpaperState(w);
    StorageManager.setWallpaper(w);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS.mint;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        wallpaper,
        setWallpaper,
        themeConfig,
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
