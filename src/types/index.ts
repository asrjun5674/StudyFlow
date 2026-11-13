/**
 * StudyFlow Type Definitions
 * Brand: StudyFlow | PLAN | LEARN | GROW
 * AI Companion: StudyFlowz
 */

export type ThemeType =
  | 'mint'
  | 'lavender'
  | 'peach'
  | 'skyblue'
  | 'sunset'
  | 'ghibli'
  | 'dark';

export type ColorMode = 'light' | 'dark' | 'system';

export type WallpaperType = 'clean' | 'meadow' | 'clouds' | 'starry' | 'cottage';

export type NavigationSection =
  | 'home'
  | 'planner'
  | 'focus'
  | 'ai'
  | 'music'
  | 'subjects'
  | 'notes'
  | 'tools'
  | 'alarms'
  | 'wellbeing'
  | 'progress'
  | 'pro'
  | 'settings';

export type PlanTier = 'free' | 'plus' | 'pro_ultra';

export type AuthMethod = 'google' | 'password' | 'guest';

export interface LocalAuthUser {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  provider: 'password';
}

export interface ParentContactConfig {
  parentName: string;
  parentEmail: string;
  parentWhatsapp: string;
}

export interface UpiPaymentReceipt {
  id: string;
  planTier: 'plus' | 'pro_ultra';
  amountInr: number;
  upiPayee: string;
  utrNumber: string;
  timestamp: string;
  status: 'verified';
}

export interface ParentReportRecord {
  id: string;
  channel: 'gmail' | 'whatsapp';
  recipient: string;
  completionRate: number;
  weeklyFocusMinutes: number;
  streakDays: number;
  timestamp: string;
  status: 'sent' | 'opened';
}

export type PriorityLevel = 'high' | 'medium' | 'low';

export type PomodoroMode = 'focus' | 'short_break' | 'long_break';

export type TaskType = 'homework' | 'exam' | 'assignment' | 'revision' | 'class';

export interface PlannerTask {
  id: string;
  title: string;
  subjectId: string;
  type: TaskType;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  durationMinutes?: number;
  priority: PriorityLevel;
  completed: boolean;
  notes?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string; // CSS color string or class
  icon: string;
  teacher?: string;
  room?: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  completed: boolean;
  notesCount: number;
}

export interface Note {
  id: string;
  title: string;
  subjectId: string;
  content: string;
  tags: string[];
  updatedAt: string;
  isPinned?: boolean;
}

export interface Flashcard {
  id: string;
  subjectId: string;
  front: string;
  back: string;
  hint?: string;
  box: number; // 1 to 5
  reviewCount: number;
  lastReviewed?: string;
}

export interface QuizQuestion {
  id: string;
  subjectId?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  feedback: string;
}

export interface SmartAlarm {
  id: string;
  title: string;
  time: string; // HH:mm
  days: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  type: 'wakeup' | 'study' | 'homework' | 'exam' | 'bedtime' | 'custom';
  enabled: boolean;
  label?: string;
}

export interface MoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  mood: 'happy' | 'calm' | 'focused' | 'tired' | 'stressed';
  energyLevel: number; // 1-5
  note?: string;
}

export interface FocusRecord {
  id: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  mode: 'focus' | 'short_break' | 'long_break';
  taskName: string;
  timestamp: string;
}

export interface StudentProfile {
  name: string;
  grade: string;
  school: string;
  avatar: string;
  dailyGoalMinutes: number;
  streakDays: number;
  lastActiveDate: string;
  language: 'en' | 'ta'; // English or Tamil
}

export interface FormulaItem {
  id: string;
  category: 'Mathematics' | 'Physics' | 'Chemistry' | 'General';
  title: string;
  formula: string;
  explanation: string;
  variables: string;
}

export interface DictionaryItem {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  tamilMeaning?: string;
}
