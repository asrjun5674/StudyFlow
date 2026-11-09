import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
  ChevronRight,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { Subject, Chapter } from '../types';

interface SubjectsViewProps {
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
  onUpdateSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onOpenNotesForSubject?: (subjectId: string) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onOpenNotesForSubject,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [showAddSubjectModal, setShowAddSubjectModal] = useState<boolean>(false);
  const [newChapterTitle, setNewChapterTitle] = useState<string>('');

  // Add Subject Form State
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newColor, setNewColor] = useState('#10b981');
  const [newIcon, setNewIcon] = useState('📚');
  const [newTeacher, setNewTeacher] = useState('');
  const [newRoom, setNewRoom] = useState('');

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddSubject({
      name: newName.trim(),
      code: newCode.trim() || 'SUB-101',
      color: newColor,
      icon: newIcon,
      teacher: newTeacher.trim() || undefined,
      room: newRoom.trim() || undefined,
      chapters: [],
    });

    setNewName('');
    setNewCode('');
    setShowAddSubjectModal(false);
  };

  const handleToggleChapter = (chapterId: string) => {
    if (!currentSubject) return;
    const updatedChapters = currentSubject.chapters.map((ch) =>
      ch.id === chapterId ? { ...ch, completed: !ch.completed } : ch
    );
    onUpdateSubject({
      ...currentSubject,
      chapters: updatedChapters,
    });
  };

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSubject || !newChapterTitle.trim()) return;

    const newChapter: Chapter = {
      id: `ch-${Date.now()}`,
      title: newChapterTitle.trim(),
      completed: false,
      notesCount: 0,
    };

    onUpdateSubject({
      ...currentSubject,
      chapters: [...currentSubject.chapters, newChapter],
    });

    setNewChapterTitle('');
  };

  const completedCount = currentSubject?.chapters.filter((c) => c.completed).length || 0;
  const totalCount = currentSubject?.chapters.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-500/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-500/30">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            Curriculum &amp; Syllabus Manager
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Subjects &amp; Chapters
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Track syllabus coverage, organize chapters, and connect directly with related revision notes and flashcards.
          </p>
        </div>

        <button
          onClick={() => setShowAddSubjectModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Subjects List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Enrolled Subjects ({subjects.length})
          </div>

          <div className="space-y-2">
            {subjects.map((sub) => {
              const isSelected = sub.id === currentSubject?.id;
              const comp = sub.chapters.filter((c) => c.completed).length;
              const total = sub.chapters.length;
              const pct = total > 0 ? Math.round((comp / total) * 100) : 0;

              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sub.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{sub.name}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {comp}/{total} chapters ({pct}%)
                      </p>
                    </div>
                  </div>

                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sub.color }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Subject Details & Chapters */}
        {currentSubject && (
          <div className="lg:col-span-8 space-y-6">
            {/* Subject Overview Card */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{currentSubject.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">{currentSubject.name}</h2>
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded font-semibold"
                        style={{
                          backgroundColor: `${currentSubject.color}20`,
                          color: currentSubject.color,
                        }}
                      >
                        {currentSubject.code}
                      </span>
                    </div>
                    {(currentSubject.teacher || currentSubject.room) && (
                      <p className="text-xs text-slate-400 mt-1">
                        Instructor: {currentSubject.teacher || 'N/A'} • {currentSubject.room || 'Main Hall'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold text-white font-mono">
                    {progressPercent}%
                  </div>
                  <span className="text-xs text-slate-400">Syllabus Mastered</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: currentSubject.color,
                  }}
                />
              </div>

              {/* Add Chapter Form */}
              <form onSubmit={handleAddChapter} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  placeholder={`Add a new chapter to ${currentSubject.name}...`}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!newChapterTitle.trim()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-40 cursor-pointer"
                >
                  Add Chapter
                </button>
              </form>
            </div>

            {/* Chapters List */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Chapters &amp; Revision Units</span>
                <span className="text-xs font-mono text-slate-400">
                  {completedCount} of {totalCount} Completed
                </span>
              </h3>

              <div className="space-y-2.5">
                {currentSubject.chapters.map((ch, idx) => (
                  <div
                    key={ch.id}
                    onClick={() => handleToggleChapter(ch.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      ch.completed
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                          ch.completed
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                            : 'border-slate-700 hover:border-emerald-400'
                        }`}
                      >
                        {ch.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <span
                        className={`text-xs font-semibold ${
                          ch.completed ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {idx + 1}. {ch.title}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono">
                      {ch.completed ? 'Completed' : 'Pending Study'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add New Subject</h3>

            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject Name:
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Computer Science & AI"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Code / Abbrev:
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="CS-101"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Icon Emoji:
                  </label>
                  <input
                    type="text"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    placeholder="💻"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Color Tag:
                </label>
                <div className="flex items-center gap-2">
                  {['#10b981', '#0ea5e9', '#a855f7', '#f97316', '#f59e0b', '#f43f5e', '#ec4899'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        newColor === c ? 'scale-110 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teacher Name:
                  </label>
                  <input
                    type="text"
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    placeholder="e.g. Mr. Anand"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Classroom:
                  </label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="Room 105"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
