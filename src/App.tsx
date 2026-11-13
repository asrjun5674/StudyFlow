/**
 * Copyright (c) 2026 StudyFlow. All rights reserved.
 * StudyFlow - Complete Student Productivity & Learning Ecosystem
 * Brand: StudyFlow | PLAN | LEARN | GROW
 * AI Companion: StudyFlowz (powered by Google Gemini)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  NavigationSection,
  PlannerTask,
  Subject,
  Note,
  SmartAlarm,
  MoodLog,
  FocusRecord,
  StudentProfile,
  PlanTier,
  ParentContactConfig,
  UpiPaymentReceipt,
  ParentReportRecord,
  LocalAuthUser,
} from './types';
import { StorageManager } from './utils/storage';
import { ThemeProvider, useTheme } from './utils/themeContext';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { StudyFlowLogo } from './components/StudyFlowLogo';
import { LessonQuizModal } from './components/LessonQuizModal';
import { AlarmRingingModal } from './components/AlarmRingingModal';
import { AuthModal } from './components/AuthModal';
import { alarmAudio } from './utils/alarmAudio';
import {
  auth,
  ensureVerifiedUserProfileInCloud,
  loadCloudUserState,
  logoutFirebaseUser,
  recordParentReportInCloud,
  recordUpiPaymentInCloud,
  resendVerificationEmail,
  updatePlanTierInCloud,
} from './utils/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

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
import { ProUpgradeView } from './views/ProUpgradeView';
import { SettingsView } from './views/SettingsView';

function StudyFlowInner() {
  const { themeConfig, wallpaper, isDark } = useTheme();

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
        'pro',
        'settings',
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

  // Pro Plans, UPI & Parent Connect Plugins state
  const [planTier, setPlanTier] = useState<PlanTier>(() => StorageManager.getPlanTier());
  const [parentContact, setParentContact] = useState<ParentContactConfig>(() =>
    StorageManager.getParentContact()
  );
  const [upiReceipts, setUpiReceipts] = useState<UpiPaymentReceipt[]>(() =>
    StorageManager.getUpiReceipts()
  );
  const [parentReports, setParentReports] = useState<ParentReportRecord[]>(() =>
    StorageManager.getParentReports()
  );

  // Firebase Authentication & Local Username/Password Session State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [localAuthUser, setLocalAuthUser] = useState<LocalAuthUser | null>(() =>
    StorageManager.getLocalAuthSession()
  );
  const [authResolved, setAuthResolved] = useState(false);
  const [guestMode, setGuestMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1' || params.has('section')) {
        return true;
      }
    }
    return StorageManager.getGuestMode();
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const isSignedIn = Boolean(firebaseUser || localAuthUser);
  const authUserLabel =
    firebaseUser?.displayName ||
    firebaseUser?.email?.split('@')[0] ||
    localAuthUser?.displayName ||
    localAuthUser?.username ||
    null;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthResolved(true);
      if (user) {
        setShowAuthModal(false);
        const providerId = user.providerData[0]?.providerId;
        const method: 'google' | 'password' = providerId === 'google.com' ? 'google' : 'password';
        if (user.emailVerified) {
          try {
            await ensureVerifiedUserProfileInCloud({
              user,
              profile: StorageManager.getProfile(),
              planTier: StorageManager.getPlanTier(),
              username: user.displayName || user.email?.split('@')[0] || 'student',
              authMethod: method,
              parentContact: StorageManager.getParentContact(),
            });
            const cloud = await loadCloudUserState(user);
            if (cloud) {
              // Preserve free Pro Ultra access; never downgrade 'pro_ultra' back to 'free'
              if (cloud.planTier === 'pro_ultra') {
                setPlanTier('pro_ultra');
                StorageManager.setPlanTier('pro_ultra');
              }
              if (cloud.parentContact) {
                setParentContact(cloud.parentContact);
                StorageManager.setParentContact(cloud.parentContact);
              }
              if (cloud.profilePatch) {
                const merged = { ...StorageManager.getProfile(), ...cloud.profilePatch };
                setProfile(merged);
                StorageManager.saveProfile(merged);
              }
              if (cloud.payments && cloud.payments.length > 0) {
                setUpiReceipts(cloud.payments);
                StorageManager.setUpiReceipts(cloud.payments);
              }
            }
          } catch (err) {
            console.warn('Cloud state sync deferred:', err);
          }
        }
      }
    });
    return () => unsub();
  }, []);

  // Show welcome Sign-In modal on fresh first visit unless user signed in or chose guest/autostart
  useEffect(() => {
    if (authResolved && !firebaseUser && !localAuthUser && !guestMode) {
      setShowAuthModal(true);
    }
  }, [authResolved, firebaseUser, localAuthUser, guestMode]);

  // Interactive Lesson Recall Quiz State (triggers when clicking finished on a lesson/task)
  const [activeQuizTask, setActiveQuizTask] = useState<PlannerTask | null>(null);

  // Active Alarm Ringing state & monitor
  const [ringingAlarm, setRingingAlarm] = useState<SmartAlarm | null>(null);
  const lastRungMinuteRef = useRef<string>('');

  // Global background alarm checker - fires chime & modal when clock hits scheduled time
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHour}:${currentMinute}`;

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const currentDay = dayNames[now.getDay()];
      const minuteKey = `${now.toDateString()}-${currentTimeStr}`;

      if (lastRungMinuteRef.current === minuteKey) {
        return; // Already triggered in this minute
      }

      const activeMatch = alarms.find(
        (a) => a.enabled && a.time === currentTimeStr && a.days.includes(currentDay)
      );

      if (activeMatch) {
        lastRungMinuteRef.current = minuteKey;
        setRingingAlarm(activeMatch);
        alarmAudio.startRingingLoop();

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
            new Notification(`StudyFlow Reminder: ${activeMatch.title}`, {
              body: activeMatch.label || 'Time for your scheduled study routine!',
            });
          } catch (e) {
            // ignore
          }
        }
      }
    };

    const interval = setInterval(checkAlarms, 2500);
    return () => clearInterval(interval);
  }, [alarms]);

  const handleDismissAlarm = () => {
    alarmAudio.stopRingingLoop();
    setRingingAlarm(null);
  };

  const handleSnoozeAlarm = (minutes: number) => {
    alarmAudio.stopRingingLoop();
    const toSnooze = ringingAlarm;
    setRingingAlarm(null);
    if (toSnooze) {
      setTimeout(() => {
        setRingingAlarm(toSnooze);
        alarmAudio.startRingingLoop();
      }, minutes * 60 * 1000);
    }
  };

  const handleAlarmStartFocus = () => {
    alarmAudio.stopRingingLoop();
    setRingingAlarm(null);
    handleNavigate('focus');
  };

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
    const existing = tasks.find((t) => t.id === taskId);
    const willBeCompleted = existing ? !existing.completed : false;

    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    StorageManager.saveTasks(updated);

    // Prompt interactive lesson quiz immediately when the student finishes a lesson!
    if (willBeCompleted && existing) {
      setActiveQuizTask(existing);
    }
  };

  const handleRewardXp = (_amount: number) => {
    // Rewarded on completing quiz
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

  // 7. Profile, Pro UPI Upgrade, Parent Plugins & Auth Handlers
  const handleUpdateProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    StorageManager.saveProfile(newProfile);
    if (firebaseUser?.emailVerified) {
      const providerId = firebaseUser.providerData[0]?.providerId;
      ensureVerifiedUserProfileInCloud({
        user: firebaseUser,
        profile: newProfile,
        planTier,
        username: firebaseUser.displayName || newProfile.name,
        authMethod: providerId === 'google.com' ? 'google' : 'password',
        parentContact,
      }).catch((e) => console.warn('Cloud profile update failed:', e));
    }
  };

  const handleUpgradePlan = (receipt: UpiPaymentReceipt) => {
    const updatedReceipts = [receipt, ...upiReceipts];
    setUpiReceipts(updatedReceipts);
    StorageManager.setUpiReceipts(updatedReceipts);
    setPlanTier(receipt.planTier);
    StorageManager.setPlanTier(receipt.planTier);
    if (firebaseUser?.emailVerified) {
      updatePlanTierInCloud(firebaseUser, receipt.planTier).catch((e) =>
        console.warn('Cloud planTier update failed:', e)
      );
      recordUpiPaymentInCloud(firebaseUser, receipt).catch((e) =>
        console.warn('Cloud payment record failed:', e)
      );
    }
  };

  const handleActivateFreePro = () => {
    setPlanTier('pro_ultra');
    StorageManager.setPlanTier('pro_ultra');
    if (firebaseUser?.emailVerified) {
      updatePlanTierInCloud(firebaseUser, 'pro_ultra').catch((e) =>
        console.warn('Cloud planTier update failed:', e)
      );
    }
  };

  const handleSaveParentContact = (cfg: ParentContactConfig) => {
    setParentContact(cfg);
    StorageManager.setParentContact(cfg);
    if (firebaseUser?.emailVerified) {
      const providerId = firebaseUser.providerData[0]?.providerId;
      ensureVerifiedUserProfileInCloud({
        user: firebaseUser,
        profile,
        planTier,
        username: firebaseUser.displayName || profile.name,
        authMethod: providerId === 'google.com' ? 'google' : 'password',
        parentContact: cfg,
      }).catch((e) => console.warn('Cloud parent contact update failed:', e));
    }
  };

  const handleRecordParentReport = (record: ParentReportRecord) => {
    const updated = [record, ...parentReports];
    setParentReports(updated);
    StorageManager.setParentReports(updated);
    if (firebaseUser?.emailVerified) {
      recordParentReportInCloud(firebaseUser, record).catch((e) =>
        console.warn('Cloud parent report log failed:', e)
      );
    }
  };

  const handleContinueAsGuest = () => {
    setGuestMode(true);
    StorageManager.setGuestMode(true);
    setShowAuthModal(false);
  };

  const handleSignOut = async () => {
    try {
      await logoutFirebaseUser();
    } catch (e) {
      console.warn('Firebase signOut error:', e);
    }
    StorageManager.setLocalAuthSession(null);
    setLocalAuthUser(null);
    setGuestMode(true);
    StorageManager.setGuestMode(true);
  };

  const handleResetData = () => {
    StorageManager.resetAllData();
    setPlanTier('pro_ultra');
    reloadAllData();
  };

  // Wallpaper decoration classes adapted to Light and Dark mode
  const getWallpaperBackground = () => {
    if (isDark) {
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
    } else {
      switch (wallpaper) {
        case 'meadow':
          return 'bg-gradient-to-b from-emerald-50/70 via-slate-50 to-teal-50/70';
        case 'clouds':
          return 'bg-gradient-to-b from-sky-50/70 via-slate-50 to-indigo-50/70';
        case 'starry':
          return 'bg-gradient-to-b from-purple-50/60 via-slate-50 to-slate-100';
        case 'cottage':
          return 'bg-gradient-to-b from-amber-50/60 via-slate-50 to-orange-50/60';
        case 'clean':
        default:
          return 'bg-slate-50';
      }
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col antialiased transition-colors duration-300 selection:bg-emerald-500/30 selection:text-emerald-200 ${
        isDark ? 'text-slate-100' : 'text-slate-900'
      } ${getWallpaperBackground()} ${themeConfig.bgClass}`}
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
          planTier={planTier}
          authUserLabel={authUserLabel}
          isSignedIn={isSignedIn}
          onOpenAuth={() => setShowAuthModal(true)}
          onSignOut={handleSignOut}
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

          {currentSection === 'ai' && (
            <StudyFlowzAiView planTier={planTier} onNavigate={handleNavigate} />
          )}

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
              onTestRing={(alarm: SmartAlarm) => {
                setRingingAlarm(alarm);
                alarmAudio.startRingingLoop();
              }}
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
              planTier={planTier}
              parentContact={parentContact}
              parentReports={parentReports}
              onSaveParentContact={handleSaveParentContact}
              onRecordReport={handleRecordParentReport}
              onNavigate={handleNavigate}
            />
          )}

          {currentSection === 'pro' && (
            <ProUpgradeView
              profile={profile}
              tasks={tasks}
              subjects={subjects}
              focusRecords={focusRecords}
              planTier={planTier}
              upiReceipts={upiReceipts}
              parentContact={parentContact}
              parentReports={parentReports}
              onUpgradePlan={handleUpgradePlan}
              onActivateFreePro={handleActivateFreePro}
              onSaveParentContact={handleSaveParentContact}
              onRecordReport={handleRecordParentReport}
              onNavigate={handleNavigate}
            />
          )}

          {currentSection === 'settings' && (
            <SettingsView
              profile={profile}
              planTier={planTier}
              authInfo={{
                isSignedIn,
                displayName:
                  firebaseUser?.displayName ||
                  localAuthUser?.displayName ||
                  localAuthUser?.username ||
                  null,
                email: firebaseUser?.email || localAuthUser?.email || null,
                emailVerified: Boolean(firebaseUser?.emailVerified),
                provider:
                  firebaseUser?.providerData[0]?.providerId === 'google.com'
                    ? 'google'
                    : isSignedIn
                    ? 'password'
                    : 'guest',
              }}
              onOpenAuth={() => setShowAuthModal(true)}
              onSignOut={handleSignOut}
              onResendVerification={resendVerificationEmail}
              onNavigate={handleNavigate}
              onUpdateProfile={handleUpdateProfile}
              onResetData={handleResetData}
            />
          )}
        </main>

        {/* Authentication Modal (Gmail + Username/Password + Guest) */}
        <AuthModal
          isOpen={showAuthModal}
          canDismiss={guestMode || isSignedIn}
          onClose={() => setShowAuthModal(false)}
          onContinueAsGuest={handleContinueAsGuest}
          onAuthSuccess={({ method, username, localUser }) => {
            if (localUser) {
              StorageManager.setLocalAuthSession(localUser);
              setLocalAuthUser(localUser);
            } else if (method === 'google') {
              StorageManager.setLocalAuthSession(null);
              setLocalAuthUser(null);
            }
            setGuestMode(false);
            StorageManager.setGuestMode(false);
            if (username && (profile.name === 'Aarav' || localUser)) {
              const updated = { ...profile, name: username };
              setProfile(updated);
              StorageManager.saveProfile(updated);
            }
            setShowAuthModal(false);
          }}
        />

        {/* Interactive Lesson Recall Modal (triggered when completing a lesson) */}
        <LessonQuizModal
          isOpen={!!activeQuizTask}
          onClose={() => setActiveQuizTask(null)}
          lessonTitle={activeQuizTask?.title || ''}
          subjectName={subjects.find((s) => s.id === activeQuizTask?.subjectId)?.name}
          subjectId={activeQuizTask?.subjectId}
          onRewardXp={handleRewardXp}
          onOpenNotes={() => handleNavigate('notes')}
        />

        {/* Real-time Alarm Ringing Alert Modal */}
        <AlarmRingingModal
          alarm={ringingAlarm}
          onDismiss={handleDismissAlarm}
          onSnooze={handleSnoozeAlarm}
          onStartFocus={handleAlarmStartFocus}
        />

        {/* Global Footer */}
        <footer
          className={`border-t py-5 px-6 text-xs mt-auto backdrop-blur-sm transition-colors ${
            isDark
              ? 'border-slate-800/80 bg-slate-950/70 text-slate-500'
              : 'border-slate-200 bg-white/70 text-slate-600'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <StudyFlowLogo variant="icon" size="xs" glow={false} />
              <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                StudyFlow
              </span>
              <span>—</span>
              <span className="text-emerald-500 dark:text-emerald-400 font-medium">
                PLAN • LEARN • GROW
              </span>
              <span>•</span>
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                &copy; {new Date().getFullYear()} StudyFlow. All rights reserved.
              </span>
            </div>
            <div className={`flex items-center gap-4 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <button
                onClick={() => handleNavigate('music')}
                className="hover:text-emerald-500 dark:hover:text-emerald-300 cursor-pointer transition-colors"
              >
                Spotify Study Music
              </button>
              <span>•</span>
              <button
                onClick={() => handleNavigate('settings')}
                className="hover:text-emerald-500 dark:hover:text-emerald-300 cursor-pointer transition-colors"
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
