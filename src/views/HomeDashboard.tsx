import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Bot,
  Flame,
  ArrowRight,
  BookOpen,
  Bell,
  Heart,
  TrendingUp,
  Plus,
  Radio,
} from 'lucide-react';
import {
  StudentProfile,
  PlannerTask,
  Subject,
  FocusRecord,
  SmartAlarm,
  NavigationSection,
} from '../types';
import {
  calculateDaysUntil,
  calculateCompletionRate,
  aggregateFocusMinutesForDate,
  formatFriendlyDate,
} from '../utils/studyLogic';
import { useTheme } from '../utils/themeContext';
import { StudyFlowLogo } from '../components/StudyFlowLogo';

interface HomeDashboardProps {
  profile: StudentProfile;
  tasks: PlannerTask[];
  subjects: Subject[];
  focusRecords: FocusRecord[];
  alarms: SmartAlarm[];
  onToggleTask: (taskId: string) => void;
  onNavigate: (section: NavigationSection) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  tasks,
  subjects,
  focusRecords,
  alarms,
  onToggleTask,
  onNavigate,
}) => {
  const { themeConfig } = useTheme();
  const today = new Date().toISOString().split('T')[0];

  const todayTasks = tasks.filter((t) => t.date === today && t.type !== 'exam');
  const upcomingExams = tasks.filter((t) => t.type === 'exam' && t.date >= today);
  const completedTodayCount = todayTasks.filter((t) => t.completed).length;
  const taskCompletionRate = calculateCompletionRate(todayTasks);

  const todayFocusMinutes = aggregateFocusMinutesForDate(focusRecords, today);
  const focusGoalPercent = Math.min(100, Math.round((todayFocusMinutes / (profile.dailyGoalMinutes || 90)) * 100));

  const getSubject = (subId: string) => subjects.find((s) => s.id === subId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Whimsical Hero Welcome Card with Official Logo */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Soft decorative glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 -bottom-10 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <StudyFlowLogo variant="icon" size="sm" animate={true} glow={true} />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
                <span className="bg-gradient-to-r from-sky-400 to-pink-400 bg-clip-text text-transparent font-bold">
                  PLAN • LEARN • GROW
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Good day, {profile.name}! {profile.avatar}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
              "Small daily steps lead to monumental understanding." Ready to conquer today's goals with StudyFlowz?
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-emerald-400" />
                {formatFriendlyDate(today)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-sky-400" />
                {todayFocusMinutes} / {profile.dailyGoalMinutes} min focused
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                {completedTodayCount} of {todayTasks.length} tasks completed
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => onNavigate('focus')}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Start Focus Session</span>
            </button>

            <button
              onClick={() => onNavigate('ai')}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 hover:from-emerald-950/80 hover:to-teal-950/80 text-emerald-300 border border-emerald-500/40 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm group"
            >
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse group-hover:scale-110 transition-transform" />
              <span>Live Voice Companion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Companionship & Anti-Loneliness Motivation Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-purple-950/20 to-teal-950/30 border border-emerald-500/25 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-xl shrink-0 shadow-sm">
            🫂
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Feeling Lonely or Need Encouragement?
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-pink-500/20 text-pink-300 font-semibold">
                StudyFlowz is here
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-relaxed">
              Studying late by yourself can get lonely. Talk out loud with StudyFlowz for instant spoken motivation, calm confidence, or friendly check-ins!
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('ai')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition-all shadow-md shadow-emerald-500/20"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Talk with StudyFlowz</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress & Focus Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Focus Goal */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Focus Time
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">
              {todayFocusMinutes} <span className="text-xs text-slate-400 font-normal">/ {profile.dailyGoalMinutes} min</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${focusGoalPercent}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">{focusGoalPercent}% of daily focus achieved</p>
        </div>

        {/* Metric 2: Today's Tasks */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tasks Completed
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">
              {completedTodayCount} <span className="text-xs text-slate-400 font-normal">/ {todayTasks.length}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${taskCompletionRate}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">{taskCompletionRate}% tasks finished</p>
        </div>

        {/* Metric 3: Active Streak */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Study Streak
            </span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono flex items-center gap-1.5">
              <span>{profile.streakDays}</span>
              <span className="text-xs text-orange-400 font-sans font-semibold">Days Unbroken!</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Keep studying daily to maintain your momentum.
            </p>
          </div>
        </div>

        {/* Metric 4: Nearest Exam Countdown */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Next Exam
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          {upcomingExams[0] ? (
            <div>
              <div className="text-2xl font-bold text-white font-mono flex items-center gap-1.5">
                <span>{calculateDaysUntil(upcomingExams[0].date, today)}</span>
                <span className="text-xs text-rose-300 font-sans font-semibold">Days Left</span>
              </div>
              <p className="text-[11px] text-slate-300 truncate mt-1">
                {upcomingExams[0].title}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-1">No upcoming exams scheduled.</p>
          )}
        </div>
      </div>

      {/* Main Content Split: Tasks & Timetable vs Upcoming Exams & Alarms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Tasks & Timetable */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Today's Schedule &amp; Homework</h3>
              </div>
              <button
                onClick={() => onNavigate('planner')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>Full Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayTasks.length > 0 ? (
              <div className="space-y-2.5">
                {todayTasks.map((task) => {
                  const sub = getSubject(task.subjectId);
                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        task.completed
                          ? 'bg-slate-100/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/60 opacity-70'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-slate-700 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => onToggleTask(task.id)}
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                            task.completed
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                              : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400'
                          }`}
                          title={task.completed ? 'Mark incomplete' : 'Mark finished'}
                          aria-label="Toggle task completed"
                        >
                          {task.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-xs font-semibold ${
                                task.completed
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              {task.title}
                            </span>
                            {sub && (
                              <span
                                className="text-[10px] font-mono px-2 py-0.5 rounded-full font-medium"
                                style={{
                                  backgroundColor: `${sub.color}20`,
                                  color: sub.color,
                                }}
                              >
                                {sub.name}
                              </span>
                            )}
                          </div>
                          {task.notes && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {task.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Time & Explicit Finished Quiz Button */}
                      <div className="flex items-center gap-2 shrink-0">
                        {task.time && (
                          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                            {task.time}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => onToggleTask(task.id)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            task.completed
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20 active:scale-95'
                          }`}
                          title="Click when finished to take the quick lesson recall quiz!"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{task.completed ? 'Finished ✓' : 'Finished'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-500 text-xs">
                No tasks scheduled for today. Take a well-deserved rest or plan ahead!
              </div>
            )}
          </div>

          {/* Quick Subjects Row */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">My Subjects</h3>
              </div>
              <button
                onClick={() => onNavigate('subjects')}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {subjects.slice(0, 6).map((sub) => {
                const completedCh = sub.chapters.filter((c) => c.completed).length;
                const totalCh = sub.chapters.length;
                const percent = totalCh > 0 ? Math.round((completedCh / totalCh) * 100) : 0;
                return (
                  <button
                    key={sub.id}
                    onClick={() => onNavigate('subjects')}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{sub.icon}</span>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">{percent}%</span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                      {sub.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {completedCh}/{totalCh} chapters completed
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Exams & Smart Reminders */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming Exams Countdown Widget */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Upcoming Examinations</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">{upcomingExams.length} Scheduled</span>
            </div>

            <div className="space-y-3">
              {upcomingExams.map((exam) => {
                const days = calculateDaysUntil(exam.date, today);
                const sub = getSubject(exam.subjectId);
                return (
                  <div key={exam.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[180px]">
                        {exam.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
                        {days === 0 ? 'Today!' : `${days}d left`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{exam.date}</span>
                      {sub && <span style={{ color: sub.color }}>{sub.name}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Smart Alarms */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Smart Reminders</h3>
              </div>
              <button
                onClick={() => onNavigate('alarms')}
                className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer font-medium"
              >
                Configure
              </button>
            </div>

            <div className="space-y-2.5">
              {alarms.filter((a) => a.enabled).slice(0, 3).map((alarm) => (
                <div key={alarm.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">{alarm.title}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{alarm.label}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                    {alarm.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Wellbeing Check-in Card */}
          <div
            onClick={() => onNavigate('wellbeing')}
            className="p-4 rounded-2xl bg-gradient-to-tr from-pink-950/30 to-purple-950/30 border border-pink-500/20 cursor-pointer hover:border-pink-500/40 transition-all"
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <Heart className="w-4 h-4 text-pink-400" />
              <h4 className="text-xs font-bold text-white">Student Wellbeing Sanctuary</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Track your daily mood, take a 2-minute box breathing break, or do simple desk stretches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
