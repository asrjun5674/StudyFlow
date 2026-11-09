import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Trash2,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  Tag,
  Save,
} from 'lucide-react';
import { Note, Subject } from '../types';

interface NotesViewProps {
  notes: Note[];
  subjects: Subject[];
  onAddNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  subjects,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Active note editing state
  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];
  const [editedTitle, setEditedTitle] = useState(activeNote?.title || '');
  const [editedContent, setEditedContent] = useState(activeNote?.content || '');

  // Sync edits when active note switches
  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setEditedTitle(note.title);
    setEditedContent(note.content);
  };

  const handleSaveActiveNote = () => {
    if (!activeNote) return;
    onUpdateNote({
      ...activeNote,
      title: editedTitle,
      content: editedContent,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  const handleCreateNewNote = () => {
    const newNote = {
      title: 'Untitled Study Note',
      subjectId: subjects[0]?.id || 'sub-math',
      content: '# New Note\n\nWrite your concepts, textbook summaries, or formulas here...',
      tags: ['Revision'],
      isPinned: false,
    };
    onAddNote(newNote);
  };

  const handleAiSummarise = async () => {
    if (!editedContent.trim()) return;
    setIsSummarizing(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Please summarize these student study notes into concise, high-yield bullet points with bold key terms:\n\n${editedContent}`,
            },
          ],
          systemInstruction: 'You are StudyFlowz, summarizing academic notes for rapid revision.',
          model: 'gemini-3.8-flash',
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setEditedContent((prev) => `${prev}\n\n## ⚡ StudyFlowz AI Revision Summary:\n${data.reply}`);
      }
    } catch (e) {
      console.warn('AI summary error:', e);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopyNote = () => {
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSub = selectedSubjectFilter === 'all' || n.subjectId === selectedSubjectFilter;
    return matchesSearch && matchesSub;
  });

  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-500/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-500/30">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            Revision Notes &amp; Summaries
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Academic Notes &amp; Highlights
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Organize formulas, key lecture takeaways, and chapter summaries with AI-assisted bullet point generation.
          </p>
        </div>

        <button
          onClick={handleCreateNewNote}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Main Notes Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Notes List & Search */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes or formulas..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Notes Scroll list */}
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredNotes.map((note) => {
              const isSelected = note.id === activeNote?.id;
              const sub = getSubject(note.subjectId);
              return (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    {sub && (
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${sub.color}20`, color: sub.color }}
                      >
                        {sub.name}
                      </span>
                    )}
                    {note.isPinned && <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                  </div>

                  <h4 className="text-xs font-bold text-white truncate">{note.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                    {note.content.replace(/[#*`_]/g, '')}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                    <span>{note.updatedAt}</span>
                    <span>{note.tags.join(', ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Note Editor */}
        {activeNote ? (
          <div className="lg:col-span-8 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between min-h-[580px] shadow-xl space-y-4">
            <div className="space-y-4">
              {/* Note Header Title & Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full sm:w-2/3 bg-transparent text-lg font-bold text-white focus:outline-none focus:border-b focus:border-emerald-500 tracking-tight"
                  placeholder="Note Title..."
                />

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={handleAiSummarise}
                    disabled={isSummarizing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isSummarizing ? 'Summarizing...' : 'AI Summarize'}</span>
                  </button>

                  <button
                    onClick={handleCopyNote}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 cursor-pointer"
                    title="Copy note"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleSaveActiveNote}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>

                  <button
                    onClick={() => onDeleteNote(activeNote.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 cursor-pointer"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Note Content Textarea */}
              <textarea
                rows={16}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Write your notes here in Markdown format..."
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              <span>Supports Markdown headings (#), bullets (-), and code blocks</span>
              <span>Updated: {activeNote.updatedAt}</span>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 rounded-2xl bg-slate-900/50 border border-slate-800 p-12 text-center text-slate-500">
            No note selected. Click "New Note" to create one.
          </div>
        )}
      </div>
    </div>
  );
};
