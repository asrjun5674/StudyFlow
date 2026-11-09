import React, { useState, useEffect } from 'react';
import {
  Menu,
  Sparkles,
  Flame,
  Palette,
  Clock,
  Bot,
  Bell,
  Search,
  Radio,
} from 'lucide-react';
import { NavigationSection, StudentProfile } from '../types';
import { useTheme, THEME_CONFIGS } from '../utils/themeContext';

import { StudyFlowLogo } from './StudyFlowLogo';

interface TopNavProps {
  profile: StudentProfile;
  onToggleMobile: () => void;
  onNavigate: (section: NavigationSection) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  profile,
  onToggleMobile,
  onNavigate,
}) => {
  const { theme, setTheme, themeConfig } = useTheme();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showThemePicker, setShowThemePicker] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Brand & Greetings */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobile}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white lg:hidden cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Logo Brand */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 cursor-pointer lg:hidden"
            title="StudyFlow Home"
          >
            <StudyFlowLogo variant="icon" size="sm" animate={true} glow={true} />
            <span className="font-extrabold text-sm tracking-tight text-white">StudyFlow</span>
          </div>

          <div className="hidden lg:block">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                Welcome back, {profile.name}! {profile.avatar}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                {profile.streakDays} Day Streak
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">
              {currentTime || 'Loading time...'}
            </p>
          </div>
        </div>

        {/* Right: Quick Actions & Theme Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick StudyFlowz Live Companion Button */}
          <button
            onClick={() => onNavigate('ai')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer transition-all shadow-sm"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Live Companion</span>
          </button>

          {/* Quick Focus Button */}
          <button
            onClick={() => onNavigate('focus')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-medium cursor-pointer transition-all"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Start Focus</span>
          </button>

          {/* Theme Palette Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-medium cursor-pointer transition-all"
              title="Change theme"
              aria-label="Change theme"
            >
              <span
                className="w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: themeConfig.primaryColor }}
              />
              <span className="hidden sm:inline">{themeConfig.name}</span>
            </button>

            {showThemePicker && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-50 space-y-1"
                onMouseLeave={() => setShowThemePicker(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Theme
                </div>
                {Object.entries(THEME_CONFIGS).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setTheme(key as any);
                      setShowThemePicker(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs text-left cursor-pointer transition-colors ${
                      theme === key
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: cfg.primaryColor }}
                    />
                    <span className="truncate">{cfg.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
