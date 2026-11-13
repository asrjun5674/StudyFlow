import {
  FocusRecord,
  PlanTier,
  PlannerTask,
  StudentProfile,
  Subject,
} from '../types';

export const UPI_NUMBER = '9841092311';
export const UPI_VPA = '9841092311@upi';
export const UPI_PAYEE_NAME = 'StudyFlow Pro';

export interface ProPlanSpec {
  id: PlanTier;
  name: string;
  priceInr: number;
  billingLabel: string;
  badge: string;
  tagline: string;
  features: string[];
  aiModels: string[];
  plugins: string[];
}

export const PRO_PLANS: ProPlanSpec[] = [
  {
    id: 'free',
    name: 'Starter Student',
    priceInr: 0,
    billingLabel: 'Free Forever',
    badge: 'Current Base',
    tagline: 'Core daily planner, Pomodoro timer, and StudyFlowz Flash AI.',
    features: [
      'Study Planner, Smart Alarms & Focus Timer',
      'StudyFlowz Flash AI (English & Tamil + Universal Understanding)',
      'Basic Progress Analytics & Recall Quizzes',
    ],
    aiModels: ['Gemini 3.8 Flash'],
    plugins: ['Local Device Storage'],
  },
  {
    id: 'plus',
    name: 'StudyFlow Plus',
    priceInr: 149,
    billingLabel: '₹149 / month',
    badge: 'Popular Upgrade',
    tagline: 'Unlock Gemini 4 Argon Deep Thinking & WhatsApp Parent Updates.',
    features: [
      'Pro Deep Thinking STEM Solver (Gemini 4 Argon)',
      'Visual Homework & Handwritten Notes Scanner',
      'WhatsApp Parent Progress Reports Plugin',
      'Priority Live Voice Companion',
    ],
    aiModels: ['Gemini 4 Argon (High Thinking)', 'Gemini 3.8 Live', 'Gemini 3.8 Flash'],
    plugins: ['WhatsApp Parent Connect', 'Cloud Profile Sync'],
  },
  {
    id: 'pro_ultra',
    name: 'StudyFlow Pro Ultra',
    priceInr: 299,
    billingLabel: 'Free Unlocked Now (₹299 value)',
    badge: 'Free Access Active • All Plugins',
    tagline: 'Full Gemini AI suite + Automated Gmail & WhatsApp Parent Reports.',
    features: [
      'All Better Gemini AI Modes (Deep Thinking, Visual Scanner, Flashcards, Voice)',
      'Gmail Direct Send Plugin (One-Click Parent Reports)',
      'WhatsApp Instant Progress Card Sharing',
      'Verified Cloud Backup & Unlimited Study Decks',
    ],
    aiModels: ['Gemini 4 Argon + ThinkingLevel.HIGH', 'Gemini 3.8 Live', 'Gemini 3.8 Flash', 'Gemini 3.1 Flash Lite'],
    plugins: ['Gmail API Parent Connect', 'WhatsApp Parent Connect', 'Firebase Cloud Sync'],
  },
];

export function buildUpiPaymentUri(params: {
  amountInr: number;
  planName: string;
  upiVpa?: string;
}): string {
  const vpa = encodeURIComponent(params.upiVpa || UPI_VPA);
  const pn = encodeURIComponent(UPI_PAYEE_NAME);
  const am = encodeURIComponent(String(Math.max(1, Math.round(params.amountInr))));
  const tn = encodeURIComponent(`StudyFlow ${params.planName}`);
  return `upi://pay?pa=${vpa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
}

export function validateUtrReference(utr: string): { valid: boolean; cleaned: string; error?: string } {
  const cleaned = utr.trim().toUpperCase();
  if (!cleaned) {
    return { valid: false, cleaned, error: 'Please enter your 12-digit UPI Transaction / UTR Reference ID.' };
  }
  if (!/^[A-Z0-9]+$/.test(cleaned)) {
    return { valid: false, cleaned, error: 'UTR reference must contain only letters and numbers (no spaces or symbols).' };
  }
  if (cleaned.length < 8 || cleaned.length > 32) {
    return { valid: false, cleaned, error: 'Enter a valid UPI / UTR reference ID (8 to 32 characters, typically 12 digits).' };
  }
  return { valid: true, cleaned };
}

export function validateUsername(username: string): { valid: boolean; normalized: string; error?: string } {
  const normalized = username.trim().toLowerCase();
  if (!normalized) {
    return { valid: false, normalized, error: 'Username is required.' };
  }
  if (normalized.length < 3 || normalized.length > 30) {
    return { valid: false, normalized, error: 'Username must be between 3 and 30 characters.' };
  }
  if (!/^[a-z0-9._-]+$/.test(normalized)) {
    return { valid: false, normalized, error: 'Username may only use letters, numbers, dots, underscores, or hyphens.' };
  }
  return { valid: true, normalized };
}

export function resolveLoginEmail(
  identifier: string,
  usernameMap: Record<string, string>
): { email: string; isSynthetic: boolean } {
  const trimmed = identifier.trim();
  if (trimmed.includes('@')) {
    return { email: trimmed.toLowerCase(), isSynthetic: false };
  }
  const normalized = trimmed.toLowerCase();
  const mapped = usernameMap[normalized];
  if (mapped) {
    return { email: mapped.toLowerCase(), isSynthetic: mapped.endsWith('@users.studyflow.app') };
  }
  return { email: `${normalized}@users.studyflow.app`, isSynthetic: true };
}

export interface ParentProgressSummary {
  studentName: string;
  grade: string;
  school: string;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  pendingTasks: number;
  weeklyFocusMinutes: number;
  todayFocusMinutes: number;
  streakDays: number;
  subjectBreakdown: Array<{
    name: string;
    completedChapters: number;
    totalChapters: number;
    masteryPercent: number;
  }>;
  overallMasteryPercent: number;
  generatedDate: string;
}

export function buildParentProgressSummary(params: {
  profile: StudentProfile;
  tasks: PlannerTask[];
  subjects: Subject[];
  focusRecords: FocusRecord[];
  now?: Date;
}): ParentProgressSummary {
  const { profile, tasks, subjects, focusRecords } = params;
  const now = params.now || new Date();
  const todayStr = now.toISOString().split('T')[0];

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const pendingTasks = Math.max(0, totalTasks - completedTasks);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Last 7 days date strings
  const last7Dates = new Set<string>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    last7Dates.add(d.toISOString().split('T')[0]);
  }

  let weeklyFocusMinutes = 0;
  let todayFocusMinutes = 0;
  for (const rec of focusRecords) {
    if (rec.mode === 'focus') {
      if (last7Dates.has(rec.date)) {
        weeklyFocusMinutes += rec.minutes;
      }
      if (rec.date === todayStr) {
        todayFocusMinutes += rec.minutes;
      }
    }
  }

  let totalChaptersAll = 0;
  let completedChaptersAll = 0;
  const subjectBreakdown = subjects.map((sub) => {
    const totalChapters = sub.chapters.length;
    const completedChapters = sub.chapters.filter((c) => c.completed).length;
    totalChaptersAll += totalChapters;
    completedChaptersAll += completedChapters;
    const masteryPercent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
    return {
      name: sub.name,
      completedChapters,
      totalChapters,
      masteryPercent,
    };
  });

  const overallMasteryPercent =
    totalChaptersAll > 0 ? Math.round((completedChaptersAll / totalChaptersAll) * 100) : 0;

  return {
    studentName: profile.name,
    grade: profile.grade,
    school: profile.school,
    completedTasks,
    totalTasks,
    completionRate,
    pendingTasks,
    weeklyFocusMinutes,
    todayFocusMinutes,
    streakDays: profile.streakDays,
    subjectBreakdown,
    overallMasteryPercent,
    generatedDate: now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  };
}

export function formatParentWhatsAppText(
  summary: ParentProgressSummary,
  parentName?: string
): string {
  const greeting = parentName?.trim() ? `Hello ${parentName.trim()},` : 'Hello Parent/Guardian,';
  const subjectLines = summary.subjectBreakdown
    .map((s) => `• ${s.name}: ${s.completedChapters}/${s.totalChapters} chapters (${s.masteryPercent}%)`)
    .join('\n');

  return [
    `📚 *StudyFlow Daily Progress Update* (${summary.generatedDate})`,
    greeting,
    `Here is *${summary.studentName}* (${summary.grade})'s latest learning progress:`,
    ``,
    `✅ *Tasks Finished:* ${summary.completedTasks}/${summary.totalTasks} (${summary.completionRate}%)`,
    `⏱️ *Focus Time:* ${summary.todayFocusMinutes} min today | ${summary.weeklyFocusMinutes} min this week`,
    `🔥 *Study Streak:* ${summary.streakDays} Days`,
    `🎯 *Overall Syllabus Mastery:* ${summary.overallMasteryPercent}%`,
    ``,
    `📖 *Subject Breakdown:*`,
    subjectLines,
    ``,
    `Sent via StudyFlow • PLAN | LEARN | GROW`,
  ].join('\n');
}

export function formatParentEmailReport(
  summary: ParentProgressSummary,
  parentName?: string
): { subject: string; body: string } {
  const subject = `StudyFlow Progress Report: ${summary.studentName} — ${summary.completionRate}% Tasks & ${summary.overallMasteryPercent}% Syllabus Completed`;
  const greeting = parentName?.trim() ? `Dear ${parentName.trim()},` : 'Dear Parent / Guardian,';
  const subjectLines = summary.subjectBreakdown
    .map((s) => `- ${s.name}: ${s.completedChapters} of ${s.totalChapters} chapters finished (${s.masteryPercent}%)`)
    .join('\n');

  const body = [
    greeting,
    '',
    `Here is the latest academic progress report for ${summary.studentName} (${summary.grade}${summary.school ? `, ${summary.school}` : ''}) as of ${summary.generatedDate}:`,
    '',
    `SUMMARY METRICS`,
    `- Homework & Tasks Completed: ${summary.completedTasks} / ${summary.totalTasks} (${summary.completionRate}%)`,
    `- Pending Tasks Remaining: ${summary.pendingTasks}`,
    `- Focus Study Time Today: ${summary.todayFocusMinutes} minutes`,
    `- Weekly Total Focus Time (7 days): ${summary.weeklyFocusMinutes} minutes`,
    `- Current Unbroken Study Streak: ${summary.streakDays} days`,
    `- Overall Syllabus Mastery: ${summary.overallMasteryPercent}%`,
    '',
    `SUBJECT-WISE PROGRESS`,
    subjectLines,
    '',
    `Warm regards,`,
    `StudyFlow • PLAN | LEARN | GROW`,
  ].join('\n');

  return { subject, body };
}

export function buildWhatsAppShareUrl(phone: string, message: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  const encoded = encodeURIComponent(message);
  if (digits.length >= 10) {
    const normalized = digits.length === 10 ? `91${digits}` : digits;
    return `https://wa.me/${normalized}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

export function encodeGmailRawMessage(params: {
  to: string;
  subject: string;
  body: string;
}): string {
  const rawEmail = [
    `To: ${params.to.trim()}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    params.body,
  ].join('\r\n');

  const utf8Bytes = new TextEncoder().encode(rawEmail);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
