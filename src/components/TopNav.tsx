import React, { useState, useEffect } from 'react';
import {
  Menu,
  Flame,
  Clock,
  Radio,
  Crown,
  LogIn,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { NavigationSection, PlanTier, StudentProfile } from '../types';
import { useTheme, THEME_CONFIGS } from '../utils/themeContext';
import { StudyFlowLogo } from './StudyFlowLogo';
import { ThemeToggle } from './ThemeToggle';

interface TopNavProps {
  profile: StudentProfile;
  planTier: PlanTier;
  authUserLabel?: string | null;
  isSignedIn: boolean;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onToggleMobile: () => void;
  onNavigate: (section: NavigationSection) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  profile,
  planTier,
  authUserLabel,
  isSignedIn,
  onOpenAuth,
  onSignOut,
  onToggleMobile,
  onNavigate,
}) => {
  const { theme, setTheme, themeConfig, isDark } = useTheme();
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
    <header className={`sticky top-0 z-30 border-b px-4 sm:px-6 py-3 transition-colors duration-300 ${themeConfig.headerBg}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Brand & Greetings */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobile}
            className={`p-2 rounded-xl border lg:hidden cursor-pointer transition-colors ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 shadow-sm'
            }`}
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
            <span className={`font-extrabold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              StudyFlow
            </span>
          </div>

          <div className="hidden lg:block min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold tracking-tight whitespace-nowrap truncate max-w-[200px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Welcome back, {profile.name}! {profile.avatar}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[11px] font-semibold whitespace-nowrap shrink-0">
                <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                {profile.streakDays}d Streak
              </span>
            </div>
            <p className={`text-[11px] font-mono hidden sm:block whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {currentTime || 'Loading time...'}
            </p>
          </div>
        </div>

        {/* Right: Quick Actions, Pro Tier, Auth, Theme Switcher & Light/Dark Mode */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle showLabel={false} compact={true} />

          {/* Pro Plans & UPI Upgrade Pill */}
          <button
            onClick={() => onNavigate('pro')}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
              planTier === 'pro_ultra'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                : planTier === 'plus'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400'
            }`}
            title="View Pro Plans & Parent Plugins"
          >
            <Crown className="w-3.5 h-3.5 shrink-0" />
            <span>
              {planTier === 'pro_ultra'
                ? 'Pro Ultra Free'
                : planTier === 'plus'
                ? 'Plus Plan'
                : 'Go Pro (UPI)'}
            </span>
          </button>

          {/* Quick StudyFlowz Live Companion Button */}
          <button
            onClick={() => onNavigate('ai')}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer transition-all shadow-sm whitespace-nowrap"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse shrink-0" />
            <span>Voice AI</span>
          </button>

          {/* Quick Focus Button */}
          <button
            onClick={() => onNavigate('focus')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="hidden lg:inline">Focus</span>
          </button>

          {/* Account Auth Button */}
          {isSignedIn ? (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onNavigate('settings')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 border-emerald-500/30 text-emerald-300'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                }`}
                title="Signed-in account settings"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="max-w-[90px] truncate hidden sm:inline">{authUserLabel || profile.name}</span>
              </button>
              <button
                onClick={onSignOut}
                className={`p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-rose-300'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-sm whitespace-nowrap shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span>Sign In</span>
            </button>
          )}

          {/* Theme Palette Dropdown Button */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className={`flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm'
              }`}
              title="Change theme palette"
              aria-label="Change theme palette"
            >
              <span
                className="w-3 h-3 rounded-full border border-white/30 shrink-0"
                style={{ backgroundColor: themeConfig.primaryColor }}
              />
              <span className="hidden sm:inline">{themeConfig.name}</span>
            </button>

            {showThemePicker && (
              <div
                className={`absolute right-0 mt-2 w-52 rounded-2xl border p-2 shadow-2xl z-50 space-y-1 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
                onMouseLeave={() => setShowThemePicker(false)}
              >
                <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Select Palette
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
                        ? isDark ? 'bg-slate-800 text-white font-semibold' : 'bg-emerald-50 text-emerald-800 font-semibold'
                        : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-700 hover:bg-slate-100'
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
