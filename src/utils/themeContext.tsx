import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeType, WallpaperType, ColorMode } from '../types';
import { StorageManager } from './storage';

export interface ThemeConfig {
  name: string;
  description: string;
  primaryColor: string;
  bgClass: string;
  cardBg: string;
  borderClass: string;
  accentClass: string;
  textClass: string;
  badgeBg: string;
  headerBg: string;
  sidebarBg: string;
  inputBg: string;
  subtextClass: string;
}

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;
  resolvedMode: 'light' | 'dark';
  isDark: boolean;
  toggleColorMode: () => void;
  wallpaper: WallpaperType;
  setWallpaper: (w: WallpaperType) => void;
  themeConfig: ThemeConfig;
}

export const THEME_PALETTES: Record<ThemeType, {
  name: string;
  description: string;
  primaryColor: string;
  light: {
    bgClass: string;
    cardBg: string;
    borderClass: string;
    accentClass: string;
    textClass: string;
    badgeBg: string;
    headerBg: string;
    sidebarBg: string;
    inputBg: string;
    subtextClass: string;
  };
  dark: {
    bgClass: string;
    cardBg: string;
    borderClass: string;
    accentClass: string;
    textClass: string;
    badgeBg: string;
    headerBg: string;
    sidebarBg: string;
    inputBg: string;
    subtextClass: string;
  };
}> = {
  mint: {
    name: 'Mint Green',
    description: 'Fresh botanical pastel, energizing & crisp',
    primaryColor: '#10b981',
    light: {
      bgClass: 'bg-emerald-50/50 text-slate-800',
      cardBg: 'bg-white/95 border-emerald-100 shadow-sm shadow-emerald-500/5',
      borderClass: 'border-emerald-200/80',
      accentClass: 'from-emerald-500 to-teal-500 text-white',
      textClass: 'text-emerald-700',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300/60',
      headerBg: 'bg-white/90 backdrop-blur-md border-emerald-100',
      sidebarBg: 'bg-white/95 border-emerald-100',
      inputBg: 'bg-emerald-50/40 border-emerald-200 text-slate-900',
      subtextClass: 'text-slate-600',
    },
    dark: {
      bgClass: 'bg-emerald-950/20 text-slate-100',
      cardBg: 'bg-slate-900/85 border-slate-800 shadow-md',
      borderClass: 'border-emerald-500/20',
      accentClass: 'from-emerald-500 to-teal-400 text-white',
      textClass: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      headerBg: 'bg-slate-950/85 backdrop-blur-md border-slate-800/80',
      sidebarBg: 'bg-slate-950/95 border-slate-800/80',
      inputBg: 'bg-slate-950 border-slate-800 text-slate-100',
      subtextClass: 'text-slate-400',
    },
  },
  lavender: {
    name: 'Lavender Whisper',
    description: 'Calming lilac & soft purple harmony',
    primaryColor: '#a855f7',
    light: {
      bgClass: 'bg-purple-50/50 text-slate-800',
      cardBg: 'bg-white/95 border-purple-100 shadow-sm shadow-purple-500/5',
      borderClass: 'border-purple-200/80',
      accentClass: 'from-purple-500 to-indigo-500 text-white',
      textClass: 'text-purple-700',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-300/60',
      headerBg: 'bg-white/90 backdrop-blur-md border-purple-100',
      sidebarBg: 'bg-white/95 border-purple-100',
      inputBg: 'bg-purple-50/40 border-purple-200 text-slate-900',
      subtextClass: 'text-slate-600',
    },
    dark: {
      bgClass: 'bg-purple-950/20 text-slate-100',
      cardBg: 'bg-slate-900/85 border-slate-800 shadow-md',
      borderClass: 'border-purple-500/20',
      accentClass: 'from-purple-500 to-indigo-400 text-white',
      textClass: 'text-purple-400',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      headerBg: 'bg-slate-950/85 backdrop-blur-md border-slate-800/80',
      sidebarBg: 'bg-slate-950/95 border-slate-800/80',
      inputBg: 'bg-slate-950 border-slate-800 text-slate-100',
      subtextClass: 'text-slate-400',
    },
  },
  peach: {
    name: 'Warm Peach',
    description: 'Cozy apricot and gentle sunny coral',
    primaryColor: '#f97316',
    light: {
      bgClass: 'bg-orange-50/50 text-slate-800',
      cardBg: 'bg-white/95 border-orange-100 shadow-sm shadow-orange-500/5',
      borderClass: 'border-orange-200/80',
      accentClass: 'from-orange-500 to-amber-500 text-white',
      textClass: 'text-orange-700',
      badgeBg: 'bg-orange-100 text-orange-800 border-orange-300/60',
      headerBg: 'bg-white/90 backdrop-blur-md border-orange-100',
      sidebarBg: 'bg-white/95 border-orange-100',
      inputBg: 'bg-orange-50/40 border-orange-200 text-slate-900',
      subtextClass: 'text-slate-600',
    },
    dark: {
      bgClass: 'bg-orange-950/20 text-slate-100',
      cardBg: 'bg-slate-900/85 border-slate-800 shadow-md',
      borderClass: 'border-orange-500/20',
      accentClass: 'from-orange-500 to-amber-400 text-white',
      textClass: 'text-orange-400',
      badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      headerBg: 'bg-slate-950/85 backdrop-blur-md border-slate-800/80',
      sidebarBg: 'bg-slate-950/95 border-slate-800/80',
      inputBg: 'bg-slate-950 border-slate-800 text-slate-100',
      subtextClass: 'text-slate-400',
    },
  },
  skyblue: {
    name: 'Sky Blue',
    description: 'Airy serene blues and cloud-like clarity',
    primaryColor: '#0ea5e9',
    light: {
      bgClass: 'bg-sky-50/50 text-slate-800',
      cardBg: 'bg-white/95 border-sky-100 shadow-sm shadow-sky-500/5',
      borderClass: 'border-sky-200/80',
      accentClass: 'from-sky-500 to-cyan-500 text-white',
      textClass: 'text-sky-700',
      badgeBg: 'bg-sky-100 text-sky-800 border-sky-300/60',
      headerBg: 'bg-white/90 backdrop-blur-md border-sky-100',
      sidebarBg: 'bg-white/95 border-sky-100',
      inputBg: 'bg-sky-50/40 border-sky-200 text-slate-900',
      subtextClass: 'text-slate-600',
    },
    dark: {
      bgClass: 'bg-sky-950/20 text-slate-100',
      cardBg: 'bg-slate-900/85 border-slate-800 shadow-md',
      borderClass: 'border-sky-500/20',
      accentClass: 'from-sky-500 to-cyan-400 text-white',
      textClass: 'text-sky-400',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      headerBg: 'bg-slate-950/85 backdrop-blur-md border-slate-800/80',
      sidebarBg: 'bg-slate-950/95 border-slate-800/80',
      inputBg: 'bg-slate-950 border-slate-800 text-slate-100',
      subtextClass: 'text-slate-400',
    },
  },
  sunset: {
    name: 'Sunset Glow',
    description: 'Vibrant golden hour pinks and warm amber',
    primaryColor: '#f43f5e',
    light: {
      bgClass: 'bg-rose-50/50 text-slate-800',
      cardBg: 'bg-white/95 border-rose-100 shadow-sm shadow-rose-500/5',
      borderClass: 'border-rose-200/80',
      accentClass: 'from-rose-500 to-amber-500 text-white',
      textClass: 'text-rose-700',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300/60',
      headerBg: 'bg-white/90 backdrop-blur-md border-rose-100',
      sidebarBg: 'bg-white/95 border-rose-100',
      inputBg: 'bg-rose-50/40 border-rose-200 text-slate-900',
      subtextClass: 'text-slate-600',
    },
    dark: {
      bgClass: 'bg-rose-950/20 text-slate-100',
      cardBg: 'bg-slate-900/85 border-slate-800 shadow-md',
      borderClass: 'border-rose-500/20',
      accentClass: 'from-rose-500 to-amber-500 text-white',
      textClass: 'text-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      headerBg: 'bg-slate-950/85 backdrop-blur-md border-slate-800/80',
      sidebarBg: 'bg-slate-950/95 border-slate-800/80',
      inputBg: 'bg-slate-950 border-slate-800 text-slate-100',
      subtextClass: 'text-slate-400',
    },
  },
  ghibli: {
    name: 'Ghibli-Inspired Meadow',
    description: 'Whimsical green hills, wild blossom pastels',
    primaryColor: '#34d399',
    light: {
      bgClass: 'bg-teal-50/60 text-slate-800',
      cardBg: 'bg-white/95 border-teal-100 shadow-sm shadow-teal-500/5',
      borderClass: 'border-teal-200/80',
      accentClass: 'from-teal-500 via-emerald-500 to-amber-400 text-white font-bold',
      textClass: 'text-teal-700',
      badgeBg: 'bg-teal-100 text-teal-800 border-teal-300/60',
      headerBg: 'bg-white/90 backdrop-blur-md border-teal-100',
      sidebarBg: 'bg-white/95 border-teal-100',
      inputBg: 'bg-teal-50/40 border-teal-200 text-slate-900',
      subtextClass: 'text-slate-600',
    },
    dark: {
      bgClass: 'bg-teal-950/30 text-slate-100',
      cardBg: 'bg-slate-900/85 border-teal-500/25 shadow-md',
      borderClass: 'border-teal-500/25',
      accentClass: 'from-teal-400 via-emerald-400 to-amber-300 text-slate-950 font-bold',
      textClass: 'text-teal-300',
      badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      headerBg: 'bg-slate-950/85 backdrop-blur-md border-slate-800/80',
      sidebarBg: 'bg-slate-950/95 border-slate-800/80',
      inputBg: 'bg-slate-950 border-slate-800 text-slate-100',
      subtextClass: 'text-slate-400',
    },
  },
  dark: {
    name: 'Deep Midnight Dark',
    description: 'Focused obsidian night with neon accents',
    primaryColor: '#6366f1',
    light: {
      bgClass: 'bg-indigo-50/40 text-slate-800',
      cardBg: 'bg-white/95 border-indigo-100 shadow-sm shadow-indigo-500/5',
      borderClass: 'border-indigo-200/80',
      accentClass: 'from-indigo-600 to-violet-600 text-white',
      textClass: 'text-indigo-700',
      badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300/60',
      headerBg: 'bg-white/90 backdrop-blur-md border-indigo-100',
      sidebarBg: 'bg-white/95 border-indigo-100',
      inputBg: 'bg-indigo-50/40 border-indigo-200 text-slate-900',
      subtextClass: 'text-slate-600',
    },
    dark: {
      bgClass: 'bg-slate-950 text-slate-100',
      cardBg: 'bg-slate-900/90 border-slate-800 shadow-md',
      borderClass: 'border-slate-800',
      accentClass: 'from-indigo-600 to-violet-600 text-white',
      textClass: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      headerBg: 'bg-slate-950/85 backdrop-blur-md border-slate-800/80',
      sidebarBg: 'bg-slate-950/95 border-slate-800/80',
      inputBg: 'bg-slate-950 border-slate-800 text-slate-100',
      subtextClass: 'text-slate-400',
    },
  },
};

// Backwards-compatible export
export const THEME_CONFIGS: Record<ThemeType, any> = Object.fromEntries(
  Object.entries(THEME_PALETTES).map(([key, val]) => [
    key,
    {
      name: val.name,
      description: val.description,
      primaryColor: val.primaryColor,
      ...val.dark,
    },
  ])
) as any;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => StorageManager.getTheme());
  const [wallpaper, setWallpaperState] = useState<WallpaperType>(() => StorageManager.getWallpaper());
  const [colorMode, setColorModeState] = useState<ColorMode>(() => StorageManager.getColorMode());

  // Determine system preference
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedMode: 'light' | 'dark' = useMemo(() => {
    if (colorMode === 'system') {
      return systemIsDark ? 'dark' : 'light';
    }
    return colorMode;
  }, [colorMode, systemIsDark]);

  const isDark = resolvedMode === 'dark';

  const setTheme = (t: ThemeType) => {
    setThemeState(t);
    StorageManager.setTheme(t);
  };

  const setWallpaper = (w: WallpaperType) => {
    setWallpaperState(w);
    StorageManager.setWallpaper(w);
  };

  const setColorMode = (m: ColorMode) => {
    setColorModeState(m);
    StorageManager.setColorMode(m);
  };

  const toggleColorMode = () => {
    const nextMode: ColorMode = isDark ? 'light' : 'dark';
    setColorMode(nextMode);
  };

  // Sync DOM attributes whenever theme or mode changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-color-mode', resolvedMode);
    if (resolvedMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme, resolvedMode]);

  const palette = THEME_PALETTES[theme] || THEME_PALETTES.mint;
  const currentModeConfig = resolvedMode === 'light' ? palette.light : palette.dark;

  const themeConfig: ThemeConfig = useMemo(() => {
    return {
      name: palette.name,
      description: palette.description,
      primaryColor: palette.primaryColor,
      ...currentModeConfig,
    };
  }, [palette, currentModeConfig]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        colorMode,
        setColorMode,
        resolvedMode,
        isDark,
        toggleColorMode,
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
