/**
 * StudyFlow Core Logic & State Utilities
 * Pure functions decoupled from React UI for testability and resilience.
 */

import {
  PlannerTask,
  FocusRecord,
  QuizQuestion,
  QuizResult,
  Flashcard,
} from '../types';

/**
 * Calculates updated Leitner box and next review interval
 */
export function calculateNextReview(currentBox: number, isCorrect: boolean): { nextBox: number; intervalDays: number } {
  const safeBox = Math.max(1, Math.min(5, Math.floor(currentBox)));
  if (isCorrect) {
    const nextBox = Math.min(5, safeBox + 1);
    const intervals = [1, 3, 7, 14, 30];
    return {
      nextBox,
      intervalDays: intervals[nextBox - 1] || 1,
    };
  } else {
    return {
      nextBox: 1,
      intervalDays: 1,
    };
  }
}

/**
 * Evaluates quiz responses and computes score, grade and actionable feedback
 */
export function evaluateQuiz(
  questions: QuizQuestion[],
  userAnswers: Record<string, number>
): QuizResult {
  if (!questions || questions.length === 0) {
    return {
      score: 0,
      total: 0,
      percentage: 0,
      passed: false,
      grade: 'F',
      feedback: 'No questions in quiz.',
    };
  }

  let score = 0;
  for (const q of questions) {
    if (userAnswers[q.id] === q.correctIndex) {
      score++;
    }
  }

  const total = questions.length;
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 70;

  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (percentage >= 90) grade = 'A';
  else if (percentage >= 80) grade = 'B';
  else if (percentage >= 70) grade = 'C';
  else if (percentage >= 60) grade = 'D';

  let feedback = '';
  if (percentage === 100) {
    feedback = 'Perfect mastery! You have completely nailed this topic.';
  } else if (percentage >= 80) {
    feedback = 'Strong grasp! Review the few missed concepts to solidify your knowledge.';
  } else if (percentage >= 60) {
    feedback = 'Good foundation, but requires additional revision on key definitions and steps.';
  } else {
    feedback = 'Needs review. We recommend asking StudyFlowz AI for a step-by-step breakdown.';
  }

  return {
    score,
    total,
    percentage,
    passed,
    grade,
    feedback,
  };
}

/**
 * Sanitizes and normalizes chat conversation history for Gemini API payload
 */
export function sanitizeChatHistory(
  messages: Array<{ role: 'user' | 'model' | 'system'; content: string }>
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const result: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const msg of messages) {
    if (msg.role === 'system') continue;
    const role = msg.role === 'user' ? 'user' : 'model';
    const text = (msg.content || '').trim();
    if (text.length > 0) {
      result.push({
        role,
        parts: [{ text }],
      });
    }
  }

  return result;
}

/**
 * Converts Float32Array audio samples (range -1.0 to 1.0) to 16-bit PCM ArrayBuffer
 */
export function float32ToInt16PCM(float32Array: Float32Array): Int16Array {
  const int16 = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}

/**
 * Converts 16-bit PCM Int16Array back to Float32Array for Web Audio playback
 */
export function int16PCMToFloat32(int16Array: Int16Array): Float32Array {
  const float32 = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32[i] = int16Array[i] / 32768.0;
  }
  return float32;
}

/**
 * Converts ArrayBuffer to Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBufferLike): string {
  let binary = '';
  const bytes = new Uint8Array(buffer as ArrayBuffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts Base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Pomodoro Phase and Mode Types
 */
export type PomodoroMode = 'focus' | 'short_break' | 'long_break';

export interface PomodoroSettings {
  focusDurationMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  roundsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

/**
 * Formats seconds into mm:ss display string (e.g. 1500 -> "25:00")
 */
export function formatTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculates percentage of timer elapsed (0% to 100%)
 */
export function calculateTimerProgress(timeRemaining: number, totalDuration: number): number {
  if (totalDuration <= 0) return 100;
  const elapsed = totalDuration - Math.max(0, timeRemaining);
  const percent = (elapsed / totalDuration) * 100;
  return Math.min(100, Math.max(0, Math.round(percent)));
}

/**
 * Determines the next Pomodoro phase and updated round count
 */
export function getNextPomodoroPhase(
  currentMode: PomodoroMode,
  completedRounds: number,
  roundsUntilLongBreak: number = 4
): { nextMode: PomodoroMode; nextCompletedRounds: number } {
  if (currentMode === 'focus') {
    const nextCompletedRounds = completedRounds + 1;
    const isLongBreak = nextCompletedRounds % roundsUntilLongBreak === 0;
    return {
      nextMode: isLongBreak ? 'long_break' : 'short_break',
      nextCompletedRounds,
    };
  } else {
    return {
      nextMode: 'focus',
      nextCompletedRounds: completedRounds,
    };
  }
}

/**
 * Calculates days remaining until an exam date (target - reference date)
 */
export function calculateDaysUntil(targetDateStr: string, referenceDateStr?: string): number {
  const ref = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const target = new Date(targetDateStr);
  const diffTime = target.getTime() - ref.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Computes completion percentage of tasks
 */
export function calculateCompletionRate(tasks: PlannerTask[]): number {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
}

/**
 * Aggregates focus minutes for a given date from focus history records
 */
export function aggregateFocusMinutesForDate(records: FocusRecord[], targetDate: string): number {
  if (!records || records.length === 0) return 0;
  return records
    .filter((r) => r.date === targetDate && r.mode === 'focus')
    .reduce((sum, r) => sum + r.minutes, 0);
}

/**
 * Formats a date into student friendly readable format (e.g. "Monday, Nov 9")
 */
export function formatFriendlyDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
