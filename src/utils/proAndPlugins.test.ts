import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UPI_NUMBER,
  UPI_VPA,
  buildUpiPaymentUri,
  validateUtrReference,
  validateUsername,
  resolveLoginEmail,
  buildParentProgressSummary,
  formatParentWhatsAppText,
  formatParentEmailReport,
  buildWhatsAppShareUrl,
  encodeGmailRawMessage,
} from './proAndPlugins';
import { generateQrMatrix } from './qrGenerator';
import { StudentProfile, PlannerTask, Subject, FocusRecord } from '../types';

const sampleProfile: StudentProfile = {
  name: 'Aarav',
  grade: 'Class 10 - CBSE',
  school: 'Greenwood High School',
  avatar: '🌱',
  dailyGoalMinutes: 90,
  streakDays: 7,
  lastActiveDate: '2026-11-13',
  language: 'en',
};

const sampleSubjects: Subject[] = [
  {
    id: 'sub-math',
    name: 'Mathematics',
    code: 'MATH-10',
    color: '#10b981',
    icon: '📐',
    chapters: [
      { id: 'c1', title: 'Polynomials', completed: true, notesCount: 2 },
      { id: 'c2', title: 'Trigonometry', completed: false, notesCount: 1 },
    ],
  },
];

const sampleTasks: PlannerTask[] = [
  {
    id: 't1',
    title: 'Trigonometry Worksheet',
    subjectId: 'sub-math',
    type: 'homework',
    date: '2026-11-13',
    priority: 'high',
    completed: true,
  },
  {
    id: 't2',
    title: 'Physics Ray Diagrams',
    subjectId: 'sub-sci',
    type: 'homework',
    date: '2026-11-13',
    priority: 'medium',
    completed: false,
  },
];

const sampleFocus: FocusRecord[] = [
  {
    id: 'f1',
    date: '2026-11-13',
    minutes: 50,
    mode: 'focus',
    taskName: 'Math Focus',
    timestamp: '10:00',
  },
  {
    id: 'f2',
    date: '2026-11-12',
    minutes: 40,
    mode: 'focus',
    taskName: 'Science Focus',
    timestamp: '18:00',
  },
];

test('UPI URI points to configured 9841092311 UPI payee', () => {
  assert.equal(UPI_NUMBER, '9841092311');
  const uri = buildUpiPaymentUri({ amountInr: 299, planName: 'Pro Ultra' });
  assert.ok(uri.startsWith(`upi://pay?pa=${encodeURIComponent(UPI_VPA)}`));
  assert.ok(uri.includes('am=299'));
  assert.ok(uri.includes('cu=INR'));
});

test('UTR validation accepts 12-digit numeric/alphanumeric refs and rejects invalid strings', () => {
  assert.equal(validateUtrReference('431890123456').valid, true);
  assert.equal(validateUtrReference('utr98ab12cd').cleaned, 'UTR98AB12CD');
  assert.equal(validateUtrReference('').valid, false);
  assert.equal(validateUtrReference('123').valid, false);
  assert.equal(validateUtrReference('1234-5678-9012').valid, false);
});

test('Username validation and email resolution work for both username-only and mapped emails', () => {
  assert.equal(validateUsername('Aarav_10').valid, true);
  assert.equal(validateUsername('Aarav_10').normalized, 'aarav_10');
  assert.equal(validateUsername('a').valid, false);
  assert.equal(validateUsername('bad name!').valid, false);

  const map = { aarav: 'aarav@gmail.com' };
  assert.deepEqual(resolveLoginEmail('aarav', map), {
    email: 'aarav@gmail.com',
    isSynthetic: false,
  });
  assert.deepEqual(resolveLoginEmail('newstudent', map), {
    email: 'newstudent@users.studyflow.app',
    isSynthetic: true,
  });
  assert.deepEqual(resolveLoginEmail('Test@Gmail.com', map), {
    email: 'test@gmail.com',
    isSynthetic: false,
  });
});

test('Parent progress summary calculates completion rate, weekly focus, and mastery', () => {
  const summary = buildParentProgressSummary({
    profile: sampleProfile,
    tasks: sampleTasks,
    subjects: sampleSubjects,
    focusRecords: sampleFocus,
    now: new Date('2026-11-13T12:00:00Z'),
  });

  assert.equal(summary.completedTasks, 1);
  assert.equal(summary.totalTasks, 2);
  assert.equal(summary.completionRate, 50);
  assert.equal(summary.todayFocusMinutes, 50);
  assert.equal(summary.weeklyFocusMinutes, 90);
  assert.equal(summary.overallMasteryPercent, 50);

  const waText = formatParentWhatsAppText(summary, 'Mrs. Priya');
  assert.ok(waText.includes('Hello Mrs. Priya,'));
  assert.ok(waText.includes('1/2 (50%)'));

  const waUrl = buildWhatsAppShareUrl('1111111111', waText);
  assert.ok(waUrl.startsWith('https://wa.me/911111111111?text='));

  const emailReport = formatParentEmailReport(summary, 'Mrs. Priya');
  assert.ok(emailReport.subject.includes('50% Tasks'));
  assert.ok(emailReport.body.includes('Mathematics: 1 of 2 chapters finished (50%)'));

  const rawB64 = encodeGmailRawMessage({
    to: 'parent@example.com',
    subject: emailReport.subject,
    body: emailReport.body,
  });
  assert.ok(!rawB64.includes('+'));
  assert.ok(!rawB64.includes('/'));
  assert.ok(!rawB64.includes('='));
});

test('QR Matrix generator creates square boolean matrix with finder patterns for UPI URI', () => {
  const uri = buildUpiPaymentUri({ amountInr: 299, planName: 'Pro Ultra' });
  const matrix = generateQrMatrix(uri);
  assert.ok(matrix.length >= 29);
  assert.equal(matrix.length, matrix[0].length);
  // Top-left 7x7 finder border checks
  assert.equal(matrix[0][0], true);
  assert.equal(matrix[1][1], false);
  assert.equal(matrix[3][3], true);
});
