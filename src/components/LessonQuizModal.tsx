import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ArrowRight,
  RotateCcw,
  BookOpen,
  X,
  Zap,
} from 'lucide-react';
import { QuizQuestion } from '../types';
import { getQuestionsForLesson } from '../data/lessonQuestions';
import { useTheme } from '../utils/themeContext';

interface LessonQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  subjectName?: string;
  subjectId?: string;
  onRewardXp?: (amount: number) => void;
  onOpenNotes?: () => void;
}

export const LessonQuizModal: React.FC<LessonQuizModalProps> = ({
  isOpen,
  onClose,
  lessonTitle,
  subjectName = 'Homework & Lesson',
  subjectId,
  onRewardXp,
  onOpenNotes,
}) => {
  const { isDark, themeConfig } = useTheme();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [resolvedTitle, setResolvedTitle] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Load questions whenever modal opens or lessonTitle changes
  useEffect(() => {
    if (isOpen && lessonTitle) {
      const data = getQuestionsForLesson(lessonTitle, subjectId);
      setQuestions(data.questions);
      setResolvedTitle(data.lessonTitle);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setUserAnswers([]);
      setIsFinished(false);
    }
  }, [isOpen, lessonTitle, subjectId]);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    setUserAnswers((prev) => [...prev, index]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      // Calculate score and award XP
      const correctCount = userAnswers.reduce((acc, ans, idx) => {
        return ans === questions[idx]?.correctIndex ? acc + 1 : acc;
      }, 0);
      const earnedXp = correctCount === 3 ? 50 : correctCount === 2 ? 35 : 20;
      if (onRewardXp) {
        onRewardXp(earnedXp);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setUserAnswers([]);
    setIsFinished(false);
  };

  const correctCount = userAnswers.reduce((acc, ans, idx) => {
    return ans === questions[idx]?.correctIndex ? acc + 1 : acc;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border transition-all duration-300 relative overflow-hidden ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Soft decorative background glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-700/40 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Lesson Completed!
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
              }`}>
                {subjectName}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold tracking-tight line-clamp-1">
              {resolvedTitle || lessonTitle}
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              StudyFlowz Quick Recall Challenge • Strengthen your memory while it's fresh!
            </p>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Close quiz"
            aria-label="Close quiz"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        {!isFinished ? (
          <div className="mt-5 space-y-5 relative z-10">
            {/* Progress Bar & Counter */}
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span className="flex items-center gap-1 text-emerald-500 font-bold">
                <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                +50 XP Challenge
              </span>
            </div>

            <div className={`w-full h-2 rounded-full overflow-hidden ${
              isDark ? 'bg-slate-800' : 'bg-slate-200'
            }`}>
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-950/70 border-slate-800/80' : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className="text-sm sm:text-base font-bold leading-relaxed">
                {currentQ.question}
              </h4>
            </div>

            {/* Answer Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;
                let optionStyle = isDark
                  ? 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-slate-200'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm';

                if (isAnswered) {
                  if (isCorrect) {
                    optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'bg-rose-500/20 border-rose-500 text-rose-400';
                  } else {
                    optionStyle = isDark ? 'opacity-40 border-slate-800' : 'opacity-40 border-slate-200';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all cursor-pointer ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isAnswered && isCorrect
                          ? 'bg-emerald-500 text-slate-950'
                          : isAnswered && isSelected && !isCorrect
                          ? 'bg-rose-500 text-white'
                          : isDark
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answer */}
            {isAnswered && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs animate-fade-in space-y-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Explanation:
                </span>
                <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`text-xs font-medium cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Skip for now
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!isAnswered}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-450 hover:to-teal-350 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>{currentIndex + 1 === totalQuestions ? 'Complete Quiz' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Completion Summary Screen */
          <div className="mt-5 space-y-6 text-center relative z-10 py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20 animate-bounce">
              {correctCount === 3 ? '🏆' : correctCount >= 2 ? '🌟' : '🌱'}
            </div>

            <div>
              <h4 className="text-xl sm:text-2xl font-black tracking-tight">
                {correctCount === 3
                  ? 'Outstanding Recall!'
                  : correctCount >= 2
                  ? 'Great Retention!'
                  : 'Good Effort! Keep Growing!'}
              </h4>
              <p className={`text-xs sm:text-sm mt-1 max-w-md mx-auto ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                You scored <strong className="text-emerald-400">{correctCount} out of {totalQuestions}</strong> correct on "{lessonTitle}".
              </p>
            </div>

            {/* Score & XP Badge */}
            <div className={`p-4 rounded-2xl border flex items-center justify-around gap-4 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Accuracy
                </span>
                <span className="text-lg font-black text-emerald-400">
                  {Math.round((correctCount / totalQuestions) * 100)}%
                </span>
              </div>
              <div className="w-px h-8 bg-slate-700/50" />
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  XP Reward
                </span>
                <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                  <Award className="w-4 h-4 fill-amber-400" />
                  +{correctCount === 3 ? 50 : correctCount === 2 ? 35 : 20} XP
                </span>
              </div>
              <div className="w-px h-8 bg-slate-700/50" />
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Memory Retention
                </span>
                <span className="text-lg font-black text-sky-400">
                  {correctCount >= 2 ? 'Strong' : 'Review Soon'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                  isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Quiz</span>
              </button>

              {onOpenNotes && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNotes();
                  }}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                    isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  <span>Review Subject Notes</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-450 hover:to-teal-350 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <span>Continue Learning</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
