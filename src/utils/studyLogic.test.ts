import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNextReview,
  evaluateQuiz,
  sanitizeChatHistory,
  float32ToInt16PCM,
  int16PCMToFloat32,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  formatTime,
  calculateTimerProgress,
  getNextPomodoroPhase,
  calculateDaysUntil,
  calculateCompletionRate,
  aggregateFocusMinutesForDate,
} from './studyLogic';
import { PlannerTask, FocusRecord } from '../types';

test('calculateNextReview increments box on correct answer up to box 5', () => {
  const step1 = calculateNextReview(1, true);
  assert.equal(step1.nextBox, 2);
  assert.equal(step1.intervalDays, 3);

  const step4 = calculateNextReview(4, true);
  assert.equal(step4.nextBox, 5);
  assert.equal(step4.intervalDays, 30);

  const step5 = calculateNextReview(5, true);
  assert.equal(step5.nextBox, 5);
  assert.equal(step5.intervalDays, 30);
});

test('calculateNextReview resets to box 1 on incorrect answer', () => {
  const failed = calculateNextReview(4, false);
  assert.equal(failed.nextBox, 1);
  assert.equal(failed.intervalDays, 1);
});

test('evaluateQuiz correctly computes score, percentage, grade and feedback', () => {
  const questions = [
    {
      id: 'q1',
      question: 'What is 2+2?',
      options: ['3', '4', '5'],
      correctIndex: 1,
      explanation: '2+2 equals 4',
    },
    {
      id: 'q2',
      question: 'Capital of France?',
      options: ['London', 'Berlin', 'Paris'],
      correctIndex: 2,
      explanation: 'Paris is the capital',
    },
  ];

  const fullScore = evaluateQuiz(questions, { q1: 1, q2: 2 });
  assert.equal(fullScore.score, 2);
  assert.equal(fullScore.total, 2);
  assert.equal(fullScore.percentage, 100);
  assert.equal(fullScore.passed, true);
  assert.equal(fullScore.grade, 'A');

  const halfScore = evaluateQuiz(questions, { q1: 1, q2: 0 });
  assert.equal(halfScore.score, 1);
  assert.equal(halfScore.percentage, 50);
  assert.equal(halfScore.passed, false);
  assert.equal(halfScore.grade, 'F');
});

test('sanitizeChatHistory omits system messages and formats user and model turns', () => {
  const raw = [
    { role: 'system' as const, content: 'You are a tutor.' },
    { role: 'user' as const, content: 'Hello!' },
    { role: 'model' as const, content: 'Hi there! How can I help?' },
    { role: 'user' as const, content: '   ' },
  ];

  const sanitized = sanitizeChatHistory(raw);
  assert.equal(sanitized.length, 2);
  assert.equal(sanitized[0].role, 'user');
  assert.equal(sanitized[0].parts[0].text, 'Hello!');
  assert.equal(sanitized[1].role, 'model');
  assert.equal(sanitized[1].parts[0].text, 'Hi there! How can I help?');
});

test('PCM audio conversion roundtrip preserves signal amplitudes', () => {
  const original = new Float32Array([0.0, 0.5, -0.5, 0.99, -0.99]);
  const pcm16 = float32ToInt16PCM(original);
  assert.equal(pcm16.length, 5);

  const restored = int16PCMToFloat32(pcm16);
  assert.equal(restored.length, 5);
  for (let i = 0; i < original.length; i++) {
    assert.ok(Math.abs(original[i] - restored[i]) < 0.001);
  }
});

test('Base64 ArrayBuffer conversion roundtrips accurately', () => {
  const buffer = new Uint8Array([1, 2, 3, 255, 128, 42]).buffer;
  const b64 = arrayBufferToBase64(buffer);
  assert.equal(typeof b64, 'string');
  const decoded = base64ToArrayBuffer(b64);
  const decodedView = new Uint8Array(decoded);
  assert.equal(decodedView.length, 6);
  assert.equal(decodedView[3], 255);
  assert.equal(decodedView[5], 42);
});

test('formatTime correctly formats seconds into mm:ss', () => {
  assert.equal(formatTime(1500), '25:00');
  assert.equal(formatTime(300), '05:00');
  assert.equal(formatTime(65), '01:05');
  assert.equal(formatTime(9), '00:09');
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(-5), '00:00');
});

test('calculateTimerProgress computes accurate percentage progress', () => {
  assert.equal(calculateTimerProgress(1500, 1500), 0);
  assert.equal(calculateTimerProgress(750, 1500), 50);
  assert.equal(calculateTimerProgress(0, 1500), 100);
  assert.equal(calculateTimerProgress(0, 0), 100);
});

test('getNextPomodoroPhase transitions between focus and breaks correctly', () => {
  const step1 = getNextPomodoroPhase('focus', 0, 4);
  assert.equal(step1.nextMode, 'short_break');
  assert.equal(step1.nextCompletedRounds, 1);

  const step2 = getNextPomodoroPhase('short_break', 1, 4);
  assert.equal(step2.nextMode, 'focus');
  assert.equal(step2.nextCompletedRounds, 1);

  const step4 = getNextPomodoroPhase('focus', 3, 4);
  assert.equal(step4.nextMode, 'long_break');
  assert.equal(step4.nextCompletedRounds, 4);
});

test('calculateDaysUntil computes days between reference date and target date', () => {
  const days = calculateDaysUntil('2026-11-20', '2026-11-15');
  assert.equal(days, 5);

  const past = calculateDaysUntil('2026-11-10', '2026-11-15');
  assert.equal(past, 0); // clamped to 0
});

test('calculateCompletionRate calculates correct percentages', () => {
  const tasks: PlannerTask[] = [
    { id: '1', title: 'Task 1', subjectId: 's1', type: 'homework', date: '2026-11-09', priority: 'high', completed: true },
    { id: '2', title: 'Task 2', subjectId: 's1', type: 'homework', date: '2026-11-09', priority: 'medium', completed: false },
    { id: '3', title: 'Task 3', subjectId: 's1', type: 'homework', date: '2026-11-09', priority: 'low', completed: true },
    { id: '4', title: 'Task 4', subjectId: 's1', type: 'homework', date: '2026-11-09', priority: 'low', completed: false },
  ];
  assert.equal(calculateCompletionRate(tasks), 50);
  assert.equal(calculateCompletionRate([]), 0);
});

test('aggregateFocusMinutesForDate sums focus time accurately', () => {
  const records: FocusRecord[] = [
    { id: '1', date: '2026-11-09', minutes: 25, mode: 'focus', taskName: 'Math', timestamp: '10:00' },
    { id: '2', date: '2026-11-09', minutes: 5, mode: 'short_break', taskName: 'Break', timestamp: '10:25' },
    { id: '3', date: '2026-11-09', minutes: 50, mode: 'focus', taskName: 'Physics', timestamp: '11:00' },
    { id: '4', date: '2026-11-08', minutes: 25, mode: 'focus', taskName: 'Chemistry', timestamp: '14:00' },
  ];
  assert.equal(aggregateFocusMinutesForDate(records, '2026-11-09'), 75);
  assert.equal(aggregateFocusMinutesForDate(records, '2026-11-08'), 25);
  assert.equal(aggregateFocusMinutesForDate(records, '2026-11-10'), 0);
});
