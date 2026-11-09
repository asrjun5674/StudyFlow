/**
 * StudyFlow - Complete Student Productivity & Learning Ecosystem
 * Brand: StudyFlow | PLAN | LEARN | GROW
 * AI Companion: StudyFlowz (powered by Google Gemini)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  NavigationSection,
  PlannerTask,
  Subject,
  Note,
  SmartAlarm,
  MoodLog,
  FocusRecord,
  StudentProfile,
} from './types';
import { StorageManager } from './utils/storage';
import { ThemeProvider, useTheme } from './utils/themeContext';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { StudyFlowLogo } from './components/StudyFlowLogo';

// Views
import { HomeDashboard } from './views/HomeDashboard';
import { StudyPlanner } from './views/StudyPlanner';
import { FocusModeView } from './views/FocusModeView';
import { StudyFlowzAiView } from './views/StudyFlowzAiView';
import { MusicView } from './views/MusicView';
import { SubjectsView } from './views/SubjectsView';
import { NotesView } from './views/NotesView';
import { StudyToolsView } from './views/StudyToolsView';
import { SmartAlarmsView } from './views/SmartAlarmsView';
import { WellbeingView } from './views/WellbeingView';
import { ProgressView } from './views/ProgressView';
import { SettingsView } from './views/SettingsView';
import { PresentationModeView } from './views/PresentationModeView';

function StudyFlowInner() {
  const { themeConfig, wallpaper } = useTheme();

  // Navigation state
  const [currentSection, setCurrentSection] = useState<NavigationSection>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sec = params.get('section') as NavigationSection;
      const validSections: NavigationSection[] = [
        'home',
        'planner',
        'focus',
        'ai',
        'music',
        'subjects',
        'notes',
        'tools',
        'alarms',
        'wellbeing',
        'progress',
        'settings',
        'presentation',
      ];
      if (sec && validSections.includes(sec)) {
        return sec;
      }
    }
    return 'home';
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  // Core application data synced with StorageManager
  const [tasks, setTasks] = useState<PlannerTask[]>(() => StorageManager.getTasks());
  const [subjects, setSubjects] = useState<Subject[]>(() => StorageManager.getSubjects());
  const [notes, setNotes] = useState<Note[]>(() => StorageManager.getNotes());
  const [alarms, setAlarms] = useState<SmartAlarm[]>(() => StorageManager.getAlarms());
  const [moods, setMoods] = useState<MoodLog[]>(() => StorageManager.getMoods());
  const [focusRecords, setFocusRecords] = useState<FocusRecord[]>(() => StorageManager.getFocusRecords());
  const [profile, setProfile] = useState<StudentProfile>(() => StorageManager.getProfile());

  // Function to reload all data from storage (after reset or import)
  const reloadAllData = useCallback(() => {
    setTasks(StorageManager.getTasks());
    setSubjects(StorageManager.getSubjects());
    setNotes(StorageManager.getNotes());
    setAlarms(StorageManager.getAlarms());
    setMoods(StorageManager.getMoods());
    setFocusRecords(StorageManager.getFocusRecords());
    setProfile(StorageManager.getProfile());
  }, []);

  // Sync section change with URL
  const handleNavigate = (section: NavigationSection) => {
    setCurrentSection(section);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('section', section);
      window.history.replaceState({}, '', url.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 1. Task Handlers
  const handleAddTask = (newTask: Omit<PlannerTask, 'id'>) => {
    const task: PlannerTask = {
      ...newTask,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [task, ...tasks];
    setTasks(updated);
    StorageManager.saveTasks(updated);
  };

  const handleUpdateTask = (updatedTask: PlannerTask) => {
    const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    setTasks(updated);
    StorageManager.saveTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    StorageManager.saveTasks(updated);
  };

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    StorageManager.saveTasks(updated);
  };

  // 2. Subject Handlers
  const handleAddSubject = (newSub: Omit<Subject, 'id'>) => {
    const sub: Subject = {
      ...newSub,
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...subjects, sub];
    setSubjects(updated);
    StorageManager.saveSubjects(updated);
  };

  const handleUpdateSubject = (updatedSub: Subject) => {
    const updated = subjects.map((s) => (s.id === updatedSub.id ? updatedSub : s));
    setSubjects(updated);
    StorageManager.saveSubjects(updated);
  };

  const handleDeleteSubject = (subjectId: string) => {
    const updated = subjects.filter((s) => s.id !== subjectId);
    setSubjects(updated);
    StorageManager.saveSubjects(updated);
  };

  // 3. Notes Handlers
  const handleAddNote = (newNote: Omit<Note, 'id' | 'updatedAt'>) => {
    const note: Note = {
      ...newNote,
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      updatedAt: new Date().toISOString(),
    };
    const updated = [note, ...notes];
    setNotes(updated);
    StorageManager.saveNotes(updated);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    const updated = notes.map((n) =>
      n.id === updatedNote.id ? { ...updatedNote, updatedAt: new Date().toISOString() } : n
    );
    setNotes(updated);
    StorageManager.saveNotes(updated);
  };

  const handleDeleteNote = (noteId: string) => {
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    StorageManager.saveNotes(updated);
  };

  // 4. Smart Alarms Handlers
  const handleAddAlarm = (newAlarm: Omit<SmartAlarm, 'id'>) => {
    const alarm: SmartAlarm = {
      ...newAlarm,
      id: `alarm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...alarms, alarm];
    setAlarms(updated);
    StorageManager.saveAlarms(updated);
  };

  const handleToggleAlarm = (alarmId: string) => {
    const updated = alarms.map((a) =>
      a.id === alarmId ? { ...a, enabled: !a.enabled } : a
    );
    setAlarms(updated);
    StorageManager.saveAlarms(updated);
  };

  const handleDeleteAlarm = (alarmId: string) => {
    const updated = alarms.filter((a) => a.id !== alarmId);
    setAlarms(updated);
    StorageManager.saveAlarms(updated);
  };

  // 5. Wellbeing Mood Handlers
  const handleLogMood = (newMood: Omit<MoodLog, 'id'>) => {
    const mood: MoodLog = {
      ...newMood,
      id: `mood-${Date.now()}`,
    };
    const filtered = moods.filter((m) => m.date !== newMood.date);
    const updated = [mood, ...filtered];
    setMoods(updated);
    StorageManager.saveMoods(updated);
  };

  // 6. Focus Session Completion Handler
  const handleSessionComplete = (mode: 'focus' | 'short_break' | 'long_break', round: number) => {
    const today = new Date().toISOString().split('T')[0];
    const minutes = mode === 'focus' ? 25 : mode === 'short_break' ? 5 : 15;
    const newRecord: FocusRecord = {
      id: `rec-${Date.now()}`,
      date: today,
      minutes,
      mode,
      taskName: mode === 'focus' ? `Study Session #${round}` : 'Rest & Recharge',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedRecords = [newRecord, ...focusRecords];
    setFocusRecords(updatedRecords);
    StorageManager.saveFocusRecords(updatedRecords);

    // If today is a new active day, increment streak
    if (profile.lastActiveDate !== today) {
      const updatedProfile = {
        ...profile,
        lastActiveDate: today,
        streakDays: profile.streakDays + 1,
      };
      setProfile(updatedProfile);
      StorageManager.saveProfile(updatedProfile);
    }
  };

  // 7. Profile & Reset Handlers
  const handleUpdateProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    StorageManager.saveProfile(newProfile);
  };

  const handleResetData = () => {
    StorageManager.resetAllData();
    reloadAllData();
  };

  // Wallpaper decoration classes
  const getWallpaperBackground = () => {
    switch (wallpaper) {
      case 'meadow':
        return 'bg-gradient-to-b from-emerald-950/20 via-slate-950 to-teal-950/20';
      case 'clouds':
        return 'bg-gradient-to-b from-sky-950/20 via-slate-950 to-indigo-950/20';
      case 'starry':
        return 'bg-gradient-to-b from-violet-950/25 via-slate-950 to-slate-950';
      case 'cottage':
        return 'bg-gradient-to-b from-amber-950/20 via-slate-950 to-orange-950/15';
      case 'clean':
      default:
        return 'bg-slate-950';
    }
  };

  return (
    <div
      className={`min-h-screen text-slate-100 flex flex-col antialiased transition-colors duration-300 selection:bg-emerald-500/30 selection:text-emerald-200 ${getWallpaperBackground()} ${themeConfig.bgClass}`}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onNavigate={handleNavigate}
        mobileOpen={mobileOpen}
        onToggleMobile={() => setMobileOpen(!mobileOpen)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 transition-all">
        {/* Top Sticky Header */}
        <TopNav
          profile={profile}
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          onNavigate={handleNavigate}
        />

        {/* View Switcher Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentSection === 'home' && (
            <HomeDashboard
              profile={profile}
              tasks={tasks}
              subjects={subjects}
              focusRecords={focusRecords}
              alarms={alarms}
              onToggleTask={handleToggleTask}
              onNavigate={handleNavigate}
            />
          )}

          {currentSection === 'planner' && (
            <StudyPlanner
              tasks={tasks}
              subjects={subjects}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onToggleTask={handleToggleTask}
            />
          )}

          {currentSection === 'focus' && (
            <FocusModeView
              focusRecords={focusRecords}
              onSessionComplete={handleSessionComplete}
            />
          )}

          {currentSection === 'ai' && <StudyFlowzAiView />}

          {currentSection === 'music' && <MusicView />}

          {currentSection === 'subjects' && (
            <SubjectsView
              subjects={subjects}
              onAddSubject={handleAddSubject}
              onUpdateSubject={handleUpdateSubject}
              onDeleteSubject={handleDeleteSubject}
              onOpenNotesForSubject={() => handleNavigate('notes')}
            />
          )}

          {currentSection === 'notes' && (
            <NotesView
              notes={notes}
              subjects={subjects}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {currentSection === 'tools' && <StudyToolsView />}

          {currentSection === 'alarms' && (
            <SmartAlarmsView
              alarms={alarms}
              onAddAlarm={handleAddAlarm}
              onToggleAlarm={handleToggleAlarm}
              onDeleteAlarm={handleDeleteAlarm}
            />
          )}

          {currentSection === 'wellbeing' && (
            <WellbeingView
              moods={moods}
              onLogMood={handleLogMood}
              onNavigate={handleNavigate}
            />
          )}

          {currentSection === 'progress' && (
            <ProgressView
              profile={profile}
              tasks={tasks}
              subjects={subjects}
              focusRecords={focusRecords}
            />
          )}

          {currentSection === 'settings' && (
            <SettingsView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onResetData={handleResetData}
            />
          )}

          {currentSection === 'presentation' && (
            <PresentationModeView
              onNavigate={handleNavigate}
              onReloadData={reloadAllData}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/70 backdrop-blur-sm py-5 px-6 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <StudyFlowLogo variant="icon" size="xs" glow={false} />
              <span className="font-bold text-slate-300">StudyFlow</span>
              <span>—</span>
              <span className="text-emerald-400 font-medium">PLAN • LEARN • GROW</span>
              <span>•</span>
              <span>PuThulir 3.0 Edition</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <button
                onClick={() => handleNavigate('presentation')}
                className="hover:text-emerald-300 cursor-pointer underline transition-colors"
              >
                PuThulir 3.0 Presentation
              </button>
              <span>•</span>
              <button
                onClick={() => handleNavigate('settings')}
                className="hover:text-emerald-300 cursor-pointer transition-colors"
              >
                Preferences &amp; Themes
              </button>
              <span>•</span>
              <span>Google Gemini AI</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <StudyFlowInner />
    </ThemeProvider>
  );
}
