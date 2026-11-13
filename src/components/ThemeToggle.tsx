import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../utils/themeContext';

interface ThemeToggleProps {
  compact?: boolean;
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  compact = false,
  showLabel = false,
  className = '',
}) => {
  const { colorMode, setColorMode, resolvedMode, isDark, toggleColorMode } = useTheme();

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {/* Quick 1-Click Toggle Button */}
      <button
        onClick={toggleColorMode}
        type="button"
        className={`relative flex items-center justify-center rounded-xl transition-all duration-300 cursor-pointer select-none active:scale-95 ${
          compact ? 'p-1.5' : 'p-2 sm:px-2.5 sm:py-2'
        } ${
          isDark
            ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 shadow-sm'
            : 'bg-white hover:bg-slate-100 text-indigo-600 border border-slate-200 shadow-sm'
        }`}
        title={`Current: ${isDark ? 'Dark Mode' : 'Light Mode'}. Click to switch to ${isDark ? 'Light Mode' : 'Dark Mode'}`}
        aria-label="Toggle Light and Dark Mode"
      >
        <div className="relative flex items-center gap-2">
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 transition-transform" />
          )}

          {showLabel && (
            <span className="text-xs font-semibold">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </div>
      </button>

      {/* Optional Mode Selector (Light | Dark | System) for Settings & Expanded Bars */}
      {!compact && showLabel && (
        <div className={`hidden sm:flex items-center p-0.5 rounded-xl border text-[11px] font-semibold ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => setColorMode('light')}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
              colorMode === 'light'
                ? 'bg-white text-indigo-600 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => setColorMode('dark')}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
              colorMode === 'dark'
                ? 'bg-slate-800 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dark
          </button>
          <button
            type="button"
            onClick={() => setColorMode('system')}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              colorMode === 'system'
                ? isDark ? 'bg-slate-800 text-white shadow-sm font-bold' : 'bg-white text-indigo-600 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Follow Operating System Preference"
          >
            <Laptop className="w-3 h-3" />
            <span>Auto</span>
          </button>
        </div>
      )}
    </div>
  );
};
