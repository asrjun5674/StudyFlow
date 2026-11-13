import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Filter,
  AlertCircle,
  Tag,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { PlannerTask, Subject, PriorityLevel, TaskType } from '../types';
import { calculateDaysUntil, formatFriendlyDate } from '../utils/studyLogic';

interface StudyPlannerProps {
  tasks: PlannerTask[];
  subjects: Subject[];
  onAddTask: (task: Omit<PlannerTask, 'id'>) => void;
  onUpdateTask: (task: PlannerTask) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  tasks,
  subjects,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
}) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'all'>('daily');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Add Task Form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || 'sub-math');
  const [newType, setNewType] = useState<TaskType>('homework');
  const [newDate, setNewDate] = useState(todayStr);
  const [newTime, setNewTime] = useState('17:00');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('medium');
  const [newNotes, setNewNotes] = useState('');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      subjectId: newSubjectId,
      type: newType,
      date: newDate,
      time: newTime,
      priority: newPriority,
      completed: false,
      notes: newNotes.trim() || undefined,
    });

    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (viewMode === 'daily' && t.date !== todayStr) return false;
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterSubject !== 'all' && t.subjectId !== filterSubject) return false;
    return true;
  });

  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Planner Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-500/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-500/30">
            <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
            Timetable &amp; Assignment Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Study Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Schedule homework, track assignment deadlines, and prepare for upcoming exams with colour-coded subject priorities.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task or Exam</span>
        </button>
      </div>

      {/* View Switcher & Filters */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Daily / Weekly / All Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 w-full md:w-auto">
          <button
            onClick={() => setViewMode('daily')}
            className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today's Tasks
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Tasks &amp; Exams ({tasks.length})
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 md:flex-initial bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Types</option>
            <option value="homework">Homework</option>
            <option value="assignment">Assignment</option>
            <option value="revision">Revision</option>
            <option value="exam">Examination</option>
          </select>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="flex-1 md:flex-initial bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List Table */}
      <div className="rounded-2xl bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>{filteredTasks.length} task(s) found</span>
          <span>Click &apos;Finished&apos; to trigger the interactive recall quiz</span>
        </div>

        {filteredTasks.length > 0 ? (
          <div className="space-y-2.5">
            {filteredTasks.map((task) => {
              const sub = getSubject(task.subjectId);
              const daysLeft = calculateDaysUntil(task.date, todayStr);
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-slate-100/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/60 opacity-65'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className={`w-5 h-5 rounded-lg border mt-0.5 sm:mt-0 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400'
                      }`}
                      aria-label="Toggle task completed"
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
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

                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-full uppercase font-bold font-mono ${
                            task.priority === 'high'
                              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
                              : task.priority === 'medium'
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>

                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                          {task.type}
                        </span>
                      </div>

                      {task.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{task.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Right: Date, Time, Finished Button & Delete */}
                  <div className="flex items-center gap-3 self-end sm:self-center text-xs text-slate-500 dark:text-slate-400 font-mono shrink-0">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {task.date} {task.time ? `• ${task.time}` : ''}
                    </span>

                    {task.type === 'exam' && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-500 dark:text-rose-300 font-bold">
                        {daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}
                      </span>
                    )}

                    {/* Prominent Finished Button that triggers the lesson recall quiz */}
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        task.completed
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20 active:scale-95'
                      }`}
                      title="Click when you finished this lesson to test your recall with questions!"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{task.completed ? 'Finished ✓' : 'Finished'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete task"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">
            No tasks match the selected filters.
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create New Task / Exam</h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Task Title:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Solve Quadratic Equations Worksheet"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subject:
                  </label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Type:
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="homework">Homework</option>
                    <option value="assignment">Assignment</option>
                    <option value="revision">Revision</option>
                    <option value="exam">Examination</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date:
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Time:
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority:
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes / Instructions (Optional):
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Key textbook pages or details..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
