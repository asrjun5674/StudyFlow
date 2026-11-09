import React, { useState } from 'react';
import {
  Layers,
  HelpCircle,
  Calendar,
  Sparkles,
  RotateCw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Flame,
  Award,
  Zap,
  Clock,
  Timer,
} from 'lucide-react';
import { Flashcard, QuizQuestion, QuizResult } from '../types';
import { calculateNextReview, evaluateQuiz } from '../utils/studyLogic';
import { PomodoroTimer } from './PomodoroTimer';

export type StudyToolsMode = 'pomodoro' | 'flashcards' | 'quiz' | 'study_plan';

export const StudyTools: React.FC = () => {
  const [activeMode, setActiveMode] = useState<StudyToolsMode>('pomodoro');
  const [topicInput, setTopicInput] = useState('Photosynthesis & Cellular Respiration');
  const [notesInput, setNotesInput] = useState(
    'Light-dependent reactions occur in thylakoid membranes, producing ATP and NADPH. The Calvin cycle occurs in stroma, fixing CO2 into G3P using RuBisCO enzyme. Cellular respiration glycolysis occurs in cytoplasm, Krebs cycle in mitochondrial matrix, and electron transport chain on cristae.'
  );
  const [modelPref, setModelPref] = useState<'fast' | 'general' | 'complex'>('fast');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: 'f1',
      subjectId: 'sub-sci',
      front: 'Where do the light-dependent reactions of photosynthesis take place?',
      back: 'In the thylakoid membranes of the chloroplast.',
      hint: 'Think membrane stacks inside the organelle',
      box: 1,
      reviewCount: 0,
    },
    {
      id: 'f2',
      subjectId: 'sub-sci',
      front: 'What primary enzyme catalyzes carbon fixation in the Calvin cycle?',
      back: 'RuBisCO (Ribulose-1,5-bisphosphate carboxylase-oxygenase).',
      hint: 'Starts with Ru...',
      box: 2,
      reviewCount: 1,
    },
    {
      id: 'f3',
      subjectId: 'sub-sci',
      front: 'Where does the Krebs (Citric Acid) Cycle occur in eukaryotes?',
      back: 'In the mitochondrial matrix.',
      hint: 'Inside the powerhouse',
      box: 1,
      reviewCount: 0,
    },
  ]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q1',
      question: 'Which of the following products from the light-dependent reactions are consumed in the Calvin cycle?',
      options: [
        'Glucose and O2',
        'ATP and NADPH',
        'CO2 and H2O',
        'Pyruvate and Acetyl-CoA',
      ],
      correctIndex: 1,
      explanation: 'ATP and NADPH produced during thylakoid photophosphorylation provide chemical energy and reducing power to fix CO2 in the stroma.',
    },
    {
      id: 'q2',
      question: 'Where is the highest concentration of protons (H+) accumulated to drive ATP synthase in mitochondria?',
      options: [
        'Mitochondrial matrix',
        'Intermembrane space',
        'Outer membrane',
        'Cytoplasm',
      ],
      correctIndex: 1,
      explanation: 'Protons are pumped from the matrix across the inner membrane into the intermembrane space, generating the proton-motive force.',
    },
  ]);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Study Plan state
  const [studyPlan, setStudyPlan] = useState<any>(null);

  // Generate Tools API Call
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicInput,
          notesText: notesInput,
          toolType: activeMode === 'pomodoro' ? 'flashcards' : activeMode,
          modelPreference: modelPref,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to generate materials');
      }

      if ((activeMode === 'flashcards' || activeMode === 'pomodoro') && Array.isArray(json.data)) {
        const formatted: Flashcard[] = json.data.map((item: any, i: number) => ({
          id: item.id || `card-${i}-${Date.now()}`,
          front: item.front || 'Prompt',
          back: item.back || 'Answer',
          hint: item.hint,
          box: 1,
          reviewCount: 0,
        }));
        setFlashcards(formatted);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setShowHint(false);
        if (activeMode === 'pomodoro') {
          setActiveMode('flashcards');
        }
      } else if (activeMode === 'quiz' && Array.isArray(json.data)) {
        setQuizQuestions(json.data);
        setUserAnswers({});
        setQuizResult(null);
      } else if (activeMode === 'study_plan') {
        setStudyPlan(json.data);
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Flashcard review action (Leitner system)
  const handleCardReview = (isCorrect: boolean) => {
    if (flashcards.length === 0) return;
    const current = flashcards[currentCardIndex];
    const { nextBox } = calculateNextReview(current.box, isCorrect);

    const updated = [...flashcards];
    updated[currentCardIndex] = {
      ...current,
      box: nextBox,
      reviewCount: current.reviewCount + 1,
    };
    setFlashcards(updated);
    setIsFlipped(false);
    setShowHint(false);

    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    }
  };

  // Quiz submission
  const handleScoreQuiz = () => {
    const outcome = evaluateQuiz(quizQuestions, userAnswers);
    setQuizResult(outcome);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-fuchsia-950/40 via-purple-950/20 to-slate-900 border border-fuchsia-600/30 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-fuchsia-500/30">
              <Zap className="w-3.5 h-3.5 text-fuchsia-400" />
              Focus &amp; Mastery Suite
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pomodoro Focus Timer &amp; Study Tools
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Lock into disciplined focus sessions with interval breaks, active recall flashcards, diagnostic quizzes, and structured mastery roadmaps.
            </p>
          </div>

          {/* Tool mode buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setActiveMode('pomodoro')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeMode === 'pomodoro'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pomodoro Timer</span>
            </button>
            <button
              onClick={() => setActiveMode('flashcards')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeMode === 'flashcards'
                  ? 'bg-fuchsia-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Flashcards Deck</span>
            </button>
            <button
              onClick={() => setActiveMode('quiz')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeMode === 'quiz'
                  ? 'bg-fuchsia-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Practice Quiz</span>
            </button>
            <button
              onClick={() => setActiveMode('study_plan')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeMode === 'study_plan'
                  ? 'bg-fuchsia-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>5-Day Roadmap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Active View: Pomodoro / Flashcards / Quiz / Roadmap */}

      {/* 1. Pomodoro Focus Timer */}
      {activeMode === 'pomodoro' && (
        <div className="space-y-6">
          <PomodoroTimer />

          {/* Quick Study Companion Card */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Science-Backed Focus Protocol
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Combine 25 or 50 minute deep focus sprints with spaced flashcard reviews to double retention.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveMode('flashcards')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                Open Flashcards ({flashcards.length})
              </button>
              <button
                onClick={() => setActiveMode('quiz')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                Open Quiz ({quizQuestions.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generator Prompt Box for Flashcards / Quizzes / Roadmap */}
      {activeMode !== 'pomodoro' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label htmlFor="topic-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Topic or Subject:
              </label>
              <input
                id="topic-input"
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g. Organic Chemistry Stereochemistry"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500 transition-colors"
              />

              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Model Speed / Depth Preference:
                </label>
                <div className="flex gap-1">
                  {[
                    { id: 'fast', label: 'Flash-Lite (Instant)', model: 'gemini-3.1-flash-lite' },
                    { id: 'general', label: 'Flash (Balanced)', model: 'gemini-3.8-flash' },
                    { id: 'complex', label: 'Argon (Complex)', model: 'gemini-4-argon' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setModelPref(item.id as any)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-medium border text-center transition-all cursor-pointer ${
                        modelPref === item.id
                          ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Source Material / Notes Text:
              </label>
              <textarea
                id="notes-input"
                rows={4}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Paste lecture notes, study outline, or concept definitions..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500 transition-colors font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400">
              Generates structured JSON with Gemini schema enforcement
            </span>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-fuchsia-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate {activeMode === 'flashcards' ? 'Flashcards' : activeMode === 'quiz' ? 'Practice Quiz' : 'Roadmap'}</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs">
              {error}
            </div>
          )}
        </div>
      )}

      {/* 2. Flashcards Deck View */}
      {activeMode === 'flashcards' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-fuchsia-400" />
              <h3 className="text-sm font-bold text-white">Active Flashcard Deck ({flashcards.length} cards)</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Card {currentCardIndex + 1} of {flashcards.length}
            </span>
          </div>

          {flashcards.length > 0 ? (
            <div className="max-w-xl mx-auto space-y-4">
              {/* Interactive Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[220px] rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-700/80 p-6 flex flex-col justify-between cursor-pointer shadow-xl hover:border-fuchsia-500/50 transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-fuchsia-400 text-[10px]">
                    {isFlipped ? 'Answer (Click to Flip)' : 'Question (Click to Flip)'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
                    Leitner Box {flashcards[currentCardIndex].box} / 5
                  </span>
                </div>

                <div className="my-auto py-4 text-center">
                  <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                    {isFlipped
                      ? flashcards[currentCardIndex].back
                      : flashcards[currentCardIndex].front}
                  </p>

                  {!isFlipped && showHint && flashcards[currentCardIndex].hint && (
                    <p className="text-xs text-amber-300/90 mt-3 italic bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                      💡 Hint: {flashcards[currentCardIndex].hint}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  {!isFlipped && flashcards[currentCardIndex].hint ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(!showHint);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                    >
                      {showHint ? 'Hide Hint' : 'Show Hint'}
                    </button>
                  ) : <span />}
                  <span className="group-hover:text-fuchsia-400 transition-colors">Tap card to flip ↻</span>
                </div>
              </div>

              {/* Spaced repetition evaluation buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleCardReview(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Again (Reset to Box 1)</span>
                </button>
                <button
                  onClick={() => handleCardReview(true)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Mastered (Advance to Box {Math.min(5, flashcards[currentCardIndex].box + 1)})</span>
                </button>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-2 pt-2">
                <button
                  onClick={() => {
                    setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                    setIsFlipped(false);
                  }}
                  disabled={currentCardIndex === 0}
                  className="flex items-center gap-1 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentCardIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
                    setIsFlipped(false);
                  }}
                  disabled={currentCardIndex === flashcards.length - 1}
                  className="flex items-center gap-1 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-slate-500 py-10">No flashcards generated yet.</p>
          )}
        </div>
      )}

      {/* 3. Practice Quiz View */}
      {activeMode === 'quiz' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-fuchsia-400" />
              <h3 className="text-sm font-bold text-white">Diagnostic Practice Quiz ({quizQuestions.length} questions)</h3>
            </div>
            {quizResult && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold">
                Score: {quizResult.score} / {quizResult.total} ({quizResult.percentage}%) - Grade {quizResult.grade}
              </span>
            )}
          </div>

          <div className="space-y-6">
            {quizQuestions.map((q, qIndex) => {
              const selectedAnswer = userAnswers[q.id];
              const isAnswered = selectedAnswer !== undefined;
              const isCorrect = selectedAnswer === q.correctIndex;

              return (
                <div key={q.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-mono text-xs flex items-center justify-center shrink-0">
                      {qIndex + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-100">{q.question}</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-8">
                    {q.options.map((opt: string, optIndex: number) => {
                      const isOptionSelected = selectedAnswer === optIndex;
                      let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850';

                      if (quizResult) {
                        if (optIndex === q.correctIndex) {
                          btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-medium';
                        } else if (isOptionSelected) {
                          btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                        }
                      } else if (isOptionSelected) {
                        btnStyle = 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-200 font-medium';
                      }

                      return (
                        <button
                          key={optIndex}
                          onClick={() => {
                            if (!quizResult) {
                              setUserAnswers({ ...userAnswers, [q.id]: optIndex });
                            }
                          }}
                          className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center gap-2 ${btnStyle}`}
                        >
                          <span className="font-mono text-slate-500">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizResult && (
                    <div className="mt-2 ml-8 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <span className="font-bold text-fuchsia-400">Explanation: </span>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {quizResult ? (
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-emerald-400">Feedback: </span>
                {quizResult.feedback}
              </div>
            ) : (
              <span className="text-xs text-slate-400">
                Answer all questions and click Submit to receive detailed scoring and rationale
              </span>
            )}

            <button
              onClick={handleScoreQuiz}
              disabled={Object.keys(userAnswers).length === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-40"
            >
              {quizResult ? 'Recalculate Score' : 'Submit & Grade Quiz'}
            </button>
          </div>
        </div>
      )}

      {/* 4. 5-Day Roadmap View */}
      {activeMode === 'study_plan' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Calendar className="w-5 h-5 text-fuchsia-400" />
            <h3 className="text-sm font-bold text-white">5-Day Mastery Roadmap</h3>
          </div>

          {studyPlan?.days ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
              {studyPlan.days.map((day: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-fuchsia-400">Day {day.dayNumber}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">{day.focusTitle}</h4>
                  <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-3">
                    {day.activities?.map((act: string, aIdx: number) => (
                      <li key={aIdx}>{act}</li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-slate-800/80 text-[10px] text-amber-300">
                    <span className="font-semibold">Check: </span>
                    {day.retentionCheckpoint}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-slate-500">
              Select "5-Day Roadmap" and click Generate to build a tailored study schedule.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
