import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Flame,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
} from 'lucide-react';
import {
  StudentProfile,
  PlannerTask,
  Subject,
  FocusRecord,
  PlanTier,
  ParentContactConfig,
  ParentReportRecord,
  NavigationSection,
} from '../types';
import { aggregateFocusMinutesForDate } from '../utils/studyLogic';
import { ParentReportPlugin } from '../components/ParentReportPlugin';

interface ProgressViewProps {
  profile: StudentProfile;
  tasks: PlannerTask[];
  subjects: Subject[];
  focusRecords: FocusRecord[];
  planTier: PlanTier;
  parentContact: ParentContactConfig;
  parentReports: ParentReportRecord[];
  onSaveParentContact: (cfg: ParentContactConfig) => void;
  onRecordReport: (record: ParentReportRecord) => void;
  onNavigate: (section: NavigationSection) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  profile,
  tasks,
  subjects,
  focusRecords,
  planTier,
  parentContact,
  parentReports,
  onSaveParentContact,
  onRecordReport,
  onNavigate,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Calculate past 7 days of focus data
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const minutes = aggregateFocusMinutesForDate(focusRecords, dStr);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    return { date: dStr, dayName, minutes };
  });

  const totalWeeklyMinutes = last7Days.reduce((acc, curr) => acc + curr.minutes, 0);
  const maxDayMinutes = Math.max(90, ...last7Days.map((d) => d.minutes));

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const milestones = [
    { title: '7-Day Study Streak', achieved: profile.streakDays >= 7, desc: 'Studied consistently every day this week' },
    { title: '100+ Focus Minutes', achieved: totalWeeklyMinutes >= 100, desc: 'Logged over 100 minutes of deep focus' },
    { title: 'Homework Master', achieved: completedTasks >= 5, desc: 'Completed 5 or more homework assignments' },
    { title: 'Active Recall Scholar', achieved: true, desc: 'Practiced spaced repetition flashcards' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-500/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-500/30">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            Performance &amp; Growth Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Learning Progress Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Real-time analytics on your study stamina, homework completion rate, and curriculum syllabus mastery.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800">
          <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
          <div>
            <span className="text-base font-bold text-white font-mono">{profile.streakDays} Days</span>
            <span className="text-[10px] text-slate-400 block">Consecutive Streak</span>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weekly Focus</span>
          <div className="text-2xl font-bold text-white font-mono">{totalWeeklyMinutes} min</div>
          <p className="text-[11px] text-slate-400">Total deep focus over last 7 days</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Tasks</span>
          <div className="text-2xl font-bold text-emerald-300 font-mono">{completedTasks} <span className="text-xs text-slate-400 font-normal">/ {totalTasks}</span></div>
          <p className="text-[11px] text-slate-400">{completionRate}% total completion rate</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Tasks</span>
          <div className="text-2xl font-bold text-amber-300 font-mono">{pendingTasks}</div>
          <p className="text-[11px] text-slate-400">Remaining to accomplish</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Enrolled Subjects</span>
          <div className="text-2xl font-bold text-sky-300 font-mono">{subjects.length}</div>
          <p className="text-[11px] text-slate-400">Active academic curricula</p>
        </div>
      </div>

      {/* Weekly Focus Time Bar Chart */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Weekly Focus Distribution (Minutes / Day)</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">{totalWeeklyMinutes} mins total</span>
        </div>

        {/* Visual Bar Graph */}
        <div className="flex items-end justify-between gap-3 pt-6 h-48 px-2">
          {last7Days.map((day, idx) => {
            const heightPercent = maxDayMinutes > 0 ? Math.round((day.minutes / maxDayMinutes) * 100) : 0;
            const isToday = day.date === today;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {day.minutes}m
                </span>

                <div className="w-full max-w-[40px] bg-slate-800/80 rounded-t-xl overflow-hidden h-full flex items-end">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-700 ${
                      isToday
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-lg shadow-emerald-500/20'
                        : 'bg-gradient-to-t from-slate-700 to-slate-500 group-hover:from-emerald-700 group-hover:to-teal-500'
                    }`}
                    style={{ height: `${Math.max(8, heightPercent)}%` }}
                  />
                </div>

                <span className={`text-xs font-medium ${isToday ? 'text-emerald-300 font-bold' : 'text-slate-400'}`}>
                  {day.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject Syllabus Mastery Breakdown */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-400" />
          <span>Subject Syllabus Mastery Progress</span>
        </h3>

        <div className="space-y-3">
          {subjects.map((sub) => {
            const comp = sub.chapters.filter((c) => c.completed).length;
            const total = sub.chapters.length;
            const pct = total > 0 ? Math.round((comp / total) * 100) : 0;
            return (
              <div key={sub.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sub.icon}</span>
                    <span className="font-bold text-white">{sub.name}</span>
                    <span className="text-slate-500 font-mono">({comp}/{total} chapters)</span>
                  </div>
                  <span className="font-mono font-bold" style={{ color: sub.color }}>{pct}%</span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: sub.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Milestone Badges */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Student Achievements &amp; Milestones</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border text-left space-y-1 ${
                m.achieved
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{m.achieved ? '🏆' : '🔒'}</span>
                <span className="text-[10px] font-mono uppercase font-bold">
                  {m.achieved ? 'Unlocked' : 'In Progress'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">{m.title}</h4>
              <p className="text-[11px] text-slate-400">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Share Progress to Parent via WhatsApp & Gmail Plugin */}
      <ParentReportPlugin
        profile={profile}
        tasks={tasks}
        subjects={subjects}
        focusRecords={focusRecords}
        planTier={planTier}
        parentContact={parentContact}
        parentReports={parentReports}
        onSaveParentContact={onSaveParentContact}
        onRecordReport={onRecordReport}
        onNavigate={onNavigate}
      />
    </div>
  );
};
