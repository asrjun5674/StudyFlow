import React, { useState, useEffect } from 'react';
import {
  Heart,
  Smile,
  Sparkles,
  Droplet,
  Eye,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Radio,
} from 'lucide-react';
import { MoodLog, NavigationSection } from '../types';

interface WellbeingViewProps {
  moods: MoodLog[];
  onLogMood: (mood: Omit<MoodLog, 'id'>) => void;
  onNavigate?: (section: NavigationSection) => void;
}

export const WellbeingView: React.FC<WellbeingViewProps> = ({
  moods,
  onLogMood,
  onNavigate,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const todayMood = moods.find((m) => m.date === today);

  const [selectedMood, setSelectedMood] = useState<'happy' | 'calm' | 'focused' | 'tired' | 'stressed'>(
    todayMood?.mood || 'focused'
  );
  const [energyLevel, setEnergyLevel] = useState<number>(todayMood?.energyLevel || 4);
  const [moodNote, setMoodNote] = useState(todayMood?.note || '');
  const [waterGlasses, setWaterGlasses] = useState<number>(5);

  // Box Breathing Exercise State (4s Inhale, 4s Hold, 4s Exhale, 4s Hold)
  const [breathingActive, setBreathingActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathCount, setBreathCount] = useState<number>(4);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (breathingActive) {
      timer = setInterval(() => {
        setBreathCount((prev) => {
          if (prev <= 1) {
            setBreathPhase((currentPhase) => {
              if (currentPhase === 'Inhale') return 'Hold';
              if (currentPhase === 'Hold') return 'Exhale';
              if (currentPhase === 'Exhale') return 'Rest';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [breathingActive]);

  const handleSaveMood = (e: React.FormEvent) => {
    e.preventDefault();
    onLogMood({
      date: today,
      mood: selectedMood,
      energyLevel,
      note: moodNote.trim() || undefined,
    });
  };

  const moodEmojis = [
    { id: 'happy', label: 'Happy & Motivated', emoji: '😄', color: 'from-amber-400 to-emerald-400' },
    { id: 'calm', label: 'Calm & Peaceful', emoji: '😌', color: 'from-sky-400 to-teal-400' },
    { id: 'focused', label: 'In the Zone', emoji: '🎯', color: 'from-emerald-400 to-indigo-400' },
    { id: 'tired', label: 'Sleepy / Tired', emoji: '🥱', color: 'from-purple-400 to-slate-400' },
    { id: 'stressed', label: 'Stressed / Overwhelmed', emoji: '😣', color: 'from-rose-400 to-amber-400' },
  ];

  const stretches = [
    {
      title: 'Gentle Neck & Shoulder Rolls',
      duration: '60 seconds',
      instructions: 'Slowly drop your chin to chest and roll your neck in gentle circles. Relieves tension from looking at screens.',
      icon: '🧘',
    },
    {
      title: 'Seated Spinal Twist',
      duration: '45 seconds each side',
      instructions: 'Sit tall, place your right hand on your left knee and gently look over your left shoulder. Breathe deeply.',
      icon: '🌿',
    },
    {
      title: 'Wrist & Finger Flexor Stretch',
      duration: '30 seconds',
      instructions: 'Extend arm forward with palm facing out. Gently pull fingers back with opposite hand. Essential for writers & coders.',
      icon: '✍️',
    },
    {
      title: '20-20-20 Eye Reset',
      duration: '20 seconds',
      instructions: 'Every 20 minutes, look at an object 20 feet away for 20 seconds. Relaxes ciliary eye muscles.',
      icon: '👁️',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/20 to-slate-900 border border-pink-500/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-pink-500/30">
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            Holistic Student Wellbeing Sanctuary
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Mindfulness, Mood &amp; Body Breaks
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            A healthy mind studies best. Track emotional balance, practice guided 4-7-8 box breathing, and recharge with quick desk yoga.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Mood Tracker & Hydration */}
        <div className="lg:col-span-6 space-y-6">
          {/* Mood Check-In Card */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smile className="w-4 h-4 text-pink-400" />
                <span>Today's Emotional Pulse</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">{today}</span>
            </div>

            <form onSubmit={handleSaveMood} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  How are you feeling right now?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {moodEmojis.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMood(m.id as any)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        selectedMood === m.id
                          ? 'bg-pink-500/20 border-pink-500 scale-105 shadow-md shadow-pink-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="text-[10px] font-medium truncate w-full text-slate-300">
                        {m.id}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                  <span className="font-semibold">Energy Level:</span>
                  <span className="font-mono text-pink-400 font-bold">{energyLevel} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Private Journal Reflection (Optional):
                </label>
                <input
                  type="text"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  placeholder="e.g. Cleared 3 physics chapters, feeling confident!"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-pink-600/20 cursor-pointer transition-all"
              >
                Log Today's Mood Check-in
              </button>
            </form>

            {/* Lonely or Overwhelmed Companion Support */}
            {onNavigate && (
              <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-pink-950/40 to-purple-950/40 border border-pink-500/25 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🫂</span>
                  <div>
                    <h5 className="text-xs font-bold text-pink-300">Feeling Lonely or Stressed?</h5>
                    <p className="text-[10px] text-slate-300">Talk out loud with StudyFlowz Live Voice for quick companion encouragement.</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('ai')}
                  className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-450 text-slate-950 font-bold text-[11px] shrink-0 cursor-pointer transition-all shadow-sm flex items-center gap-1"
                >
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>Talk Now</span>
                </button>
              </div>
            )}
          </div>

          {/* Hydration Tracker */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Hydration &amp; Water Balance</h3>
              </div>
              <span className="text-xs font-mono text-sky-400 font-bold">
                {waterGlasses} / 8 Glasses
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 py-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-7 h-10 rounded-lg flex items-center justify-center border transition-all ${
                    i < waterGlasses
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                      : 'bg-slate-950 border-slate-800 text-slate-700'
                  }`}
                >
                  <Droplet className={`w-4 h-4 ${i < waterGlasses ? 'fill-sky-400' : ''}`} />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setWaterGlasses((prev) => Math.max(0, prev - 1))}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-300 font-medium">Log Glass of Water</span>
              <button
                onClick={() => setWaterGlasses((prev) => Math.min(12, prev + 1))}
                className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs shadow-md shadow-sky-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Box Breathing Guide & Desk Stretches */}
        <div className="lg:col-span-6 space-y-6">
          {/* Animated Box Breathing Card */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col items-center justify-between min-h-[300px] text-center space-y-4">
            <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Box Breathing (4-4-4-4 Protocol)
              </span>
              <span className="text-[11px] text-slate-400">Lowers Cortisol &amp; Anxiety</span>
            </div>

            {/* Glowing Breathing Circle */}
            <div className="my-auto relative flex items-center justify-center">
              <div
                className={`w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${
                  breathingActive
                    ? breathPhase === 'Inhale'
                      ? 'scale-125 bg-gradient-to-tr from-emerald-500/30 to-teal-400/20 shadow-2xl shadow-emerald-500/30 border-2 border-emerald-400'
                      : breathPhase === 'Hold'
                      ? 'scale-125 bg-teal-500/20 border-2 border-teal-400'
                      : breathPhase === 'Exhale'
                      ? 'scale-90 bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border-2 border-sky-400'
                      : 'scale-90 bg-slate-800/80 border-2 border-slate-700'
                    : 'bg-slate-950 border border-slate-800'
                }`}
              >
                <span className="text-sm font-bold text-white tracking-wider uppercase">
                  {breathingActive ? breathPhase : 'Ready'}
                </span>
                {breathingActive && (
                  <span className="text-3xl font-mono font-extrabold text-emerald-300 mt-1">
                    {breathCount}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setBreathingActive(!breathingActive)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer ${
                  breathingActive
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                }`}
              >
                {breathingActive ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{breathingActive ? 'Pause Exercise' : 'Start 2-Min Reset'}</span>
              </button>
            </div>
          </div>

          {/* Quick Desk Stretches */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Desk Yoga &amp; Micro-Stretches</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stretches.map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{s.icon} {s.title}</span>
                    <span className="text-[10px] font-mono text-emerald-400">{s.duration}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{s.instructions}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
