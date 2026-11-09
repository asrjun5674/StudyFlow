import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Settings,
  Bell,
  BellOff,
  Flame,
  Coffee,
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  Minus,
} from 'lucide-react';
import {
  PomodoroMode,
  formatTime,
  calculateTimerProgress,
  getNextPomodoroPhase,
} from '../utils/studyLogic';

interface PomodoroTimerProps {
  onSessionComplete?: (mode: PomodoroMode, round: number) => void;
  className?: string;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  onSessionComplete,
  className = '',
}) => {
  // Settings
  const [focusDuration, setFocusDuration] = useState<number>(25 * 60); // in seconds
  const [shortBreakDuration, setShortBreakDuration] = useState<number>(5 * 60);
  const [longBreakDuration, setLongBreakDuration] = useState<number>(15 * 60);
  const [roundsUntilLongBreak, setRoundsUntilLongBreak] = useState<number>(4);
  const [autoStartBreaks, setAutoStartBreaks] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Runtime State
  const [currentMode, setCurrentMode] = useState<PomodoroMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(focusDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedRounds, setCompletedRounds] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<string>('Mastering Active Recall & Concept Practice');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play synthetic pleasant chime on completion using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2); // A5

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  // Get current phase total duration
  const getTotalDuration = (mode: PomodoroMode): number => {
    switch (mode) {
      case 'focus':
        return focusDuration;
      case 'short_break':
        return shortBreakDuration;
      case 'long_break':
        return longBreakDuration;
    }
  };

  // Switch mode manually
  const switchMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setCurrentMode(newMode);
    setTimeLeft(getTotalDuration(newMode));
  };

  // Skip to next phase
  const handleSkip = () => {
    const { nextMode, nextCompletedRounds } = getNextPomodoroPhase(
      currentMode,
      completedRounds,
      roundsUntilLongBreak
    );
    setCompletedRounds(nextCompletedRounds);
    setCurrentMode(nextMode);
    setTimeLeft(getTotalDuration(nextMode));
    setIsRunning(autoStartBreaks && nextMode !== 'focus');
  };

  // Main countdown timer interval
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished
            playChime();
            const { nextMode, nextCompletedRounds } = getNextPomodoroPhase(
              currentMode,
              completedRounds,
              roundsUntilLongBreak
            );
            setCompletedRounds(nextCompletedRounds);
            setCurrentMode(nextMode);
            onSessionComplete?.(currentMode, nextCompletedRounds);

            const nextDuration = getTotalDuration(nextMode);
            setIsRunning(autoStartBreaks && nextMode !== 'focus');
            return nextDuration;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, currentMode, completedRounds, roundsUntilLongBreak, autoStartBreaks]);

  // Quick duration adjusters (+/- 1 min)
  const adjustTime = (amountSeconds: number) => {
    setTimeLeft((prev) => Math.max(60, prev + amountSeconds));
  };

  const totalDuration = getTotalDuration(currentMode);
  const progressPercent = calculateTimerProgress(timeLeft, totalDuration);

  // SVG Ring calculation
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const currentRoundInCycle = (completedRounds % roundsUntilLongBreak) + 1;

  const modeTheme = {
    focus: {
      label: 'Focus Session',
      color: 'from-indigo-500 to-violet-500',
      strokeColor: '#6366f1',
      glow: 'shadow-indigo-500/20',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: Flame,
    },
    short_break: {
      label: 'Short Break',
      color: 'from-sky-500 to-teal-500',
      strokeColor: '#0ea5e9',
      glow: 'shadow-sky-500/20',
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      icon: Coffee,
    },
    long_break: {
      label: 'Long Rest & Recharge',
      color: 'from-amber-500 to-orange-500',
      strokeColor: '#f59e0b',
      glow: 'shadow-amber-500/20',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: Sparkles,
    },
  }[currentMode];

  const ModeIcon = modeTheme.icon;

  return (
    <div className={`rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl relative overflow-hidden ${className}`}>
      {/* Background radial highlight */}
      <div
        className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 ${
          currentMode === 'focus'
            ? 'bg-indigo-600'
            : currentMode === 'short_break'
            ? 'bg-sky-600'
            : 'bg-amber-600'
        }`}
      />

      {/* Header bar: Mode Selector & Settings Button */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">StudyFlow Pomodoro Timer</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 text-indigo-300 border-slate-700'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
            aria-label={soundEnabled ? 'Mute timer chime' : 'Enable timer chime'}
          >
            {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              showSettings
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Pomodoro settings"
            aria-label="Pomodoro settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center gap-2 my-4 relative z-10">
        <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => switchMode('focus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentMode === 'focus'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Focus ({Math.round(focusDuration / 60)}m)
          </button>
          <button
            onClick={() => switchMode('short_break')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentMode === 'short_break'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Short Break ({Math.round(shortBreakDuration / 60)}m)
          </button>
          <button
            onClick={() => switchMode('long_break')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentMode === 'long_break'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Long Break ({Math.round(longBreakDuration / 60)}m)
          </button>
        </div>
      </div>

      {/* Main Circular Timer Display */}
      <div className="flex flex-col items-center justify-center my-6 relative z-10">
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* SVG Progress Ring */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Background track circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="#1e293b"
              strokeWidth="10"
            />
            {/* Animated progress stroke */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke={modeTheme.strokeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 border ${modeTheme.badge}`}>
              <ModeIcon className="w-3 h-3" />
              {modeTheme.label}
            </span>

            <span className="text-4xl sm:text-5xl font-mono font-extrabold text-white tracking-tight">
              {formatTime(timeLeft)}
            </span>

            {/* Quick +/- 1 min micro adjusters */}
            <div className="flex items-center gap-2 mt-2 opacity-80 hover:opacity-100 transition-opacity">
              <button
                onClick={() => adjustTime(-60)}
                className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center cursor-pointer border border-slate-700"
                title="Subtract 1 minute"
                aria-label="Subtract 1 minute"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-[10px] text-slate-400 font-mono">
                {progressPercent}%
              </span>
              <button
                onClick={() => adjustTime(60)}
                className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center cursor-pointer border border-slate-700"
                title="Add 1 minute"
                aria-label="Add 1 minute"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Cycle dots indicator (Round X of 4) */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs text-slate-400 font-medium">
            Cycle Progress:
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: roundsUntilLongBreak }).map((_, idx) => {
              const isCompleted = (completedRounds % roundsUntilLongBreak) > idx;
              const isCurrent = (completedRounds % roundsUntilLongBreak) === idx && currentMode === 'focus';
              return (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all ${
                    isCompleted
                      ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                      : isCurrent
                      ? 'bg-indigo-400 animate-pulse ring-2 ring-indigo-400/30'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                  title={`Pomodoro round ${idx + 1}`}
                />
              );
            })}
          </div>
          <span className="text-xs font-mono text-slate-400 ml-1">
            ({completedRounds} completed)
          </span>
        </div>
      </div>

      {/* Main Action Controls */}
      <div className="flex items-center justify-center gap-3 relative z-10">
        <button
          onClick={() => {
            setTimeLeft(getTotalDuration(currentMode));
            setIsRunning(false);
          }}
          className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all cursor-pointer ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-white" />
              <span>Pause Focus</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white" />
              <span>Start {modeTheme.label}</span>
            </>
          )}
        </button>

        <button
          onClick={handleSkip}
          className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
          title="Skip to next phase"
          aria-label="Skip to next phase"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Current Task Tag & Input */}
      <div className="mt-6 pt-4 border-t border-slate-800 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <label htmlFor="pomodoro-task" className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Active Study Objective:
          </label>
          <input
            id="pomodoro-task"
            type="text"
            value={currentTask}
            onChange={(e) => setCurrentTask(e.target.value)}
            placeholder="What are you focusing on during this session?"
            className="w-full sm:w-80 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Settings Drawer / Panel */}
      {showSettings && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 relative z-10">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Timer Customization
            </span>
            <span className="text-[11px] text-slate-400">Settings save automatically</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="focus-minutes" className="block text-[11px] text-slate-400 mb-1">
                Focus (Minutes):
              </label>
              <input
                id="focus-minutes"
                type="number"
                min="1"
                max="120"
                value={Math.round(focusDuration / 60)}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value));
                  setFocusDuration(val * 60);
                  if (currentMode === 'focus' && !isRunning) {
                    setTimeLeft(val * 60);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label htmlFor="short-break-minutes" className="block text-[11px] text-slate-400 mb-1">
                Short Break (Minutes):
              </label>
              <input
                id="short-break-minutes"
                type="number"
                min="1"
                max="30"
                value={Math.round(shortBreakDuration / 60)}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value));
                  setShortBreakDuration(val * 60);
                  if (currentMode === 'short_break' && !isRunning) {
                    setTimeLeft(val * 60);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label htmlFor="long-break-minutes" className="block text-[11px] text-slate-400 mb-1">
                Long Break (Minutes):
              </label>
              <input
                id="long-break-minutes"
                type="number"
                min="1"
                max="60"
                value={Math.round(longBreakDuration / 60)}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value));
                  setLongBreakDuration(val * 60);
                  if (currentMode === 'long_break' && !isRunning) {
                    setTimeLeft(val * 60);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoStartBreaks}
                onChange={(e) => setAutoStartBreaks(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0"
              />
              <span>Auto-start breaks when focus session finishes</span>
            </label>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Presets:</span>
              <button
                onClick={() => {
                  setFocusDuration(25 * 60);
                  setShortBreakDuration(5 * 60);
                  setLongBreakDuration(15 * 60);
                  if (!isRunning) setTimeLeft(25 * 60);
                }}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-indigo-300 cursor-pointer"
              >
                Classic (25/5)
              </button>
              <button
                onClick={() => {
                  setFocusDuration(50 * 60);
                  setShortBreakDuration(10 * 60);
                  setLongBreakDuration(20 * 60);
                  if (!isRunning) setTimeLeft(50 * 60);
                }}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-amber-300 cursor-pointer"
              >
                Deep Work (50/10)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
