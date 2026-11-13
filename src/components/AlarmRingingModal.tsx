import React from 'react';
import { Bell, Clock, Check, Moon, Sun, BookOpen, Volume2 } from 'lucide-react';
import { SmartAlarm } from '../types';

interface AlarmRingingModalProps {
  alarm: SmartAlarm | null;
  onDismiss: () => void;
  onSnooze: (minutesOrAlarm?: any) => void;
  onStartFocus?: () => void;
}

export const AlarmRingingModal: React.FC<AlarmRingingModalProps> = ({
  alarm,
  onDismiss,
  onSnooze,
  onStartFocus,
}) => {
  if (!alarm) return null;

  const getTypeIcon = (t: SmartAlarm['type']) => {
    switch (t) {
      case 'wakeup':
        return Sun;
      case 'bedtime':
        return Moon;
      case 'study':
      case 'homework':
      case 'exam':
        return BookOpen;
      default:
        return Bell;
    }
  };

  const Icon = getTypeIcon(alarm.type);

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/60 p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-amber-500/20 text-center space-y-6">
        {/* Pulsating Bell Badge */}
        <div className="relative inline-flex mx-auto">
          <div className="absolute -inset-4 rounded-full bg-amber-500/20 animate-ping opacity-75" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/40">
            <Bell className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        {/* Alarm Info */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-500/30">
            <Icon className="w-3.5 h-3.5" />
            <span>StudyFlow Smart Alarm Ringing</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {alarm.title}
          </h2>

          <div className="text-3xl font-mono font-black text-amber-400 tracking-wider">
            {alarm.time}
          </div>

          {alarm.label && (
            <p className="text-sm text-slate-300 italic max-w-sm mx-auto bg-slate-800/60 py-2 px-3 rounded-xl border border-slate-700/50">
              &ldquo;{alarm.label}&rdquo;
            </p>
          )}
        </div>

        {/* Audio active indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-amber-300/80">
          <Volume2 className="w-4 h-4 animate-pulse text-amber-400" />
          <span>Melodic Alarm Chime is active</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onSnooze(5)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer border border-slate-700"
            >
              <Clock className="w-4 h-4" />
              <span>Snooze (5m)</span>
            </button>

            <button
              type="button"
              onClick={onDismiss}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>I&apos;m Ready / Stop</span>
            </button>
          </div>

          {onStartFocus && (
            <button
              type="button"
              onClick={onStartFocus}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Start Focus Session Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
