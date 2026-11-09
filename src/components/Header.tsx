import React from 'react';
import {
  Mic,
  Brain,
  FileSearch,
  MessageSquareText,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

export type TabType = 'voice' | 'thinking' | 'scanner' | 'chat' | 'tools';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  voiceActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  voiceActive = false,
}) => {
  const tabs = [
    {
      id: 'voice' as TabType,
      label: 'Voice Tutor',
      modelTag: 'gemini-3.8-live',
      icon: Mic,
      badge: 'Live Audio',
    },
    {
      id: 'thinking' as TabType,
      label: 'Deep Thinking',
      modelTag: 'gemini-4-argon',
      icon: Brain,
      badge: 'High Thinking',
    },
    {
      id: 'scanner' as TabType,
      label: 'Visual Scanner',
      modelTag: 'gemini-4-argon',
      icon: FileSearch,
      badge: 'Multimodal',
    },
    {
      id: 'chat' as TabType,
      label: 'Chat Tutor',
      modelTag: 'gemini-3.8-flash',
      icon: MessageSquareText,
      badge: 'Multi-Role',
    },
    {
      id: 'tools' as TabType,
      label: 'Study Decks',
      modelTag: 'gemini-3.1-flash-lite',
      icon: Layers,
      badge: 'Spaced Repetition',
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[2px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent tracking-tight">
                  StudyFlow
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden xl:block">
                Gemini-Powered Multi-Modality Study Engine
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1" aria-label="Main Navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-slate-800/90 text-white shadow-sm shadow-indigo-500/10 border border-slate-700/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.id === 'voice' && voiceActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                  {isActive && (
                    <span className="hidden md:inline-block text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      {tab.modelTag.replace('gemini-', '')}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Model Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-slate-400 text-[11px]">Gemini 4 / 3.8 Suite</span>
          </div>
        </div>
      </div>
    </header>
  );
};
