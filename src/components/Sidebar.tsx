import React from 'react';
import {
  Home,
  Calendar,
  Clock,
  Bot,
  Music,
  BookOpen,
  FileText,
  Layers,
  Bell,
  Heart,
  BarChart3,
  Settings,
  X,
  Crown,
} from 'lucide-react';
import { NavigationSection } from '../types';
import { useTheme } from '../utils/themeContext';
import { StudyFlowLogo } from './StudyFlowLogo';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  currentSection: NavigationSection;
  onNavigate: (section: NavigationSection) => void;
  mobileOpen: boolean;
  onToggleMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  mobileOpen,
  onToggleMobile,
}) => {
  const { themeConfig, isDark } = useTheme();

  const navItems: Array<{
    id: NavigationSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    { id: 'home', label: 'Home – My Day', icon: Home },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'focus', label: 'Focus Mode', icon: Clock },
    { id: 'ai', label: 'StudyFlowz AI', icon: Bot, badge: 'Live Voice' },
    { id: 'music', label: 'Music & Ambience', icon: Music },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'tools', label: 'Study Tools', icon: Layers, badge: 'Recall' },
    { id: 'alarms', label: 'Smart Alarms', icon: Bell },
    { id: 'wellbeing', label: 'Wellbeing', icon: Heart },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'pro', label: 'Pro Plans & Plugins', icon: Crown, badge: 'UPI' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (section: NavigationSection) => {
    onNavigate(section);
    if (mobileOpen) onToggleMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onToggleMobile}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          themeConfig.sidebarBg
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand Header with Official StudyFlow Logo */}
        <div className="p-4 border-b border-slate-700/20 flex items-center justify-between">
          <div
            onClick={() => handleSelect('home')}
            className="cursor-pointer group transition-transform active:scale-95"
            title="Go to Home - StudyFlow"
          >
            <StudyFlowLogo variant="horizontal" size="sm" animate={true} glow={true} />
          </div>

          <button
            onClick={onToggleMobile}
            className={`p-1.5 rounded-lg lg:hidden cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                      : 'bg-emerald-100/70 text-emerald-800 border border-emerald-300/80 shadow-sm font-semibold'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                        : isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                      isActive
                        ? isDark
                          ? 'bg-emerald-500/25 text-emerald-200'
                          : 'bg-emerald-200 text-emerald-900'
                        : isDark
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions: Theme Toggle & AI Companion Quick Card */}
        <div className="p-3 border-t border-slate-700/20 space-y-2.5">
          <div className="flex items-center justify-between px-2">
            <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Display Mode:
            </span>
            <ThemeToggle showLabel={false} compact={true} />
          </div>

          <div
            onClick={() => handleSelect('ai')}
            className={`p-3 rounded-xl border cursor-pointer transition-all group ${
              isDark
                ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30 border-emerald-500/25 hover:border-emerald-500/50'
                : 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-400 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-lg">🤖</span>
              <div>
                <h4 className={`text-xs font-bold transition-colors ${
                  isDark ? 'text-white group-hover:text-emerald-300' : 'text-slate-900 group-hover:text-emerald-700'
                }`}>
                  StudyFlowz AI
                </h4>
                <p className={`text-[10px] ${isDark ? 'text-emerald-400' : 'text-emerald-700 font-medium'}`}>
                  Your Friendly Companion
                </p>
              </div>
            </div>
            <p className={`text-[11px] line-clamp-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Real-time Live Voice &amp; chat companion. English &amp; தமிழ் supported, with universal understanding of all world languages.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
