import React from 'react';
import { Clock, Flame, Award, History, Sparkles } from 'lucide-react';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { FocusRecord, PomodoroMode } from '../types';
import { aggregateFocusMinutesForDate } from '../utils/studyLogic';

interface FocusModeViewProps {
  focusRecords: FocusRecord[];
  onSessionComplete: (mode: PomodoroMode, round: number) => void;
}

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  focusRecords,
  onSessionComplete,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const todayMinutes = aggregateFocusMinutesForDate(focusRecords, today);
  const completedFocusSessions = focusRecords.filter(
    (r) => r.date === today && r.mode === 'focus'
  ).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Focus Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950/40 via-violet-950/20 to-slate-900 border border-indigo-500/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-indigo-500/30">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Distraction-Free Deep Work
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Focus Mode &amp; Pomodoro Sprints
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Train deep concentration through structured 25-minute sprints and restorative 5-minute breaks.
          </p>
        </div>

        {/* Focus Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Today's Focus</span>
            <span className="text-base font-bold text-indigo-300 font-mono">{todayMinutes} min</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sessions</span>
            <span className="text-base font-bold text-emerald-300 font-mono">{completedFocusSessions}</span>
          </div>
        </div>
      </div>

      {/* Main Pomodoro Workstation */}
      <PomodoroTimer onSessionComplete={onSessionComplete} />

      {/* Focus History Log */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Today's Focus Session History</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {focusRecords.length} recorded session(s)
          </span>
        </div>

        {focusRecords.length > 0 ? (
          <div className="space-y-2">
            {focusRecords.slice(0, 6).map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      rec.mode === 'focus'
                        ? 'bg-indigo-400'
                        : rec.mode === 'short_break'
                        ? 'bg-sky-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200">
                      {rec.taskName || 'Focus Session'}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase font-mono ml-2">
                      [{rec.mode.replace('_', ' ')}]
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
                  <span className="text-slate-300 font-semibold">{rec.minutes}m</span>
                  <span>•</span>
                  <span>{rec.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            No focus sessions logged yet today. Press "Start Focus Session" above to begin your first sprint!
          </div>
        )}
      </div>
    </div>
  );
};
