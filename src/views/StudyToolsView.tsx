import React, { useState } from 'react';
import {
  Layers,
  HelpCircle,
  BookOpen,
  FileSearch,
  Sigma,
  BookA,
  Network,
  Sparkles,
  Search,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Plus,
} from 'lucide-react';
import { Flashcard, QuizQuestion, FormulaItem, DictionaryItem, QuizResult } from '../types';
import { FORMULA_COLLECTION, DICTIONARY_COLLECTION } from '../utils/storage';
import { calculateNextReview, evaluateQuiz } from '../utils/studyLogic';
import { ImageScanner } from '../components/ImageScanner';

export const StudyToolsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'flashcards' | 'quiz' | 'formulas' | 'dictionary' | 'mindmap' | 'scanner'>('flashcards');

  // 1. Flashcards State
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: 'f1',
      subjectId: 'sub-sci',
      front: 'What is Snell\'s Law of Refraction?',
      back: 'n₁ · sin(θ₁) = n₂ · sin(θ₂), where n is the refractive index and θ is the angle of incidence/refraction.',
      hint: 'Relates sine of angles and refractive indices',
      box: 2,
      reviewCount: 1,
    },
    {
      id: 'f2',
      subjectId: 'sub-math',
      front: 'State the Fundamental Theorem of Arithmetic',
      back: 'Every composite number can be uniquely factored as a product of prime numbers, except for the order of factors.',
      hint: 'Think prime factorization uniqueness',
      box: 1,
      reviewCount: 0,
    },
    {
      id: 'f3',
      subjectId: 'sub-chem',
      front: 'What is the chemical formula of Plaster of Paris?',
      back: 'CaSO₄ · ½H₂O (Calcium sulphate hemihydrate).',
      hint: 'Hemihydrate of calcium sulphate',
      box: 3,
      reviewCount: 2,
    },
  ]);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // 2. Quiz State
  const [quizQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q1',
      question: 'Which mirror is commonly used as a rear-view mirror in vehicles and why?',
      options: [
        'Concave mirror because it forms magnified real images',
        'Convex mirror because it gives an erect diminished image with a wider field of view',
        'Plane mirror because it produces unmagnified laterally inverted images',
        'Parabolic mirror because it focuses distant headlights',
      ],
      correctIndex: 1,
      explanation: 'Convex mirrors always produce an erect, diminished virtual image and have a wide curved field of view enabling the driver to see traffic behind.',
    },
    {
      id: 'q2',
      question: 'If the discriminant D = b² - 4ac of a quadratic equation is equal to 0, what can be concluded about its roots?',
      options: [
        'The roots are real and distinct',
        'The roots are imaginary (complex conjugates)',
        'The roots are real and equal',
        'No solution exists',
      ],
      correctIndex: 2,
      explanation: 'When D = 0, both roots are real and equal to -b / (2a).',
    },
  ]);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // 3. Formula Sheet State
  const [formulaCategory, setFormulaCategory] = useState<string>('All');
  const [formulaSearch, setFormulaSearch] = useState('');

  // 4. Dictionary State
  const [dictionarySearch, setDictionarySearch] = useState('');

  // Flashcard review action
  const handleCardReview = (isCorrect: boolean) => {
    if (flashcards.length === 0) return;
    const current = flashcards[cardIndex];
    const { nextBox } = calculateNextReview(current.box, isCorrect);
    const updated = [...flashcards];
    updated[cardIndex] = {
      ...current,
      box: nextBox,
      reviewCount: current.reviewCount + 1,
    };
    setFlashcards(updated);
    setIsFlipped(false);
    setShowHint(false);
    if (cardIndex < flashcards.length - 1) {
      setCardIndex((prev) => prev + 1);
    }
  };

  const handleScoreQuiz = () => {
    const res = evaluateQuiz(quizQuestions, userAnswers);
    setQuizResult(res);
  };

  const filteredFormulas = FORMULA_COLLECTION.filter((f) => {
    const matchesCat = formulaCategory === 'All' || f.category === formulaCategory;
    const matchesSearch =
      f.title.toLowerCase().includes(formulaSearch.toLowerCase()) ||
      f.formula.toLowerCase().includes(formulaSearch.toLowerCase()) ||
      f.explanation.toLowerCase().includes(formulaSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredWords = DICTIONARY_COLLECTION.filter((d) => {
    return (
      d.word.toLowerCase().includes(dictionarySearch.toLowerCase()) ||
      d.definition.toLowerCase().includes(dictionarySearch.toLowerCase()) ||
      (d.tamilMeaning && d.tamilMeaning.includes(dictionarySearch))
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-fuchsia-950/40 via-purple-950/20 to-slate-900 border border-fuchsia-500/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-fuchsia-500/30">
            <Layers className="w-3.5 h-3.5 text-fuchsia-400" />
            Active Recall &amp; Cognitive Tools
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Study Tools &amp; Memory Arsenal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Reinforce learning through Leitner flashcards, diagnostic quizzes, formula quick-lookup sheets, student dictionary, and visual mind maps.
          </p>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setActiveSubTab('flashcards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'flashcards' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Flashcards
          </button>
          <button
            onClick={() => setActiveSubTab('quiz')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'quiz' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Quizzes
          </button>
          <button
            onClick={() => setActiveSubTab('formulas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'formulas' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Formula Sheet
          </button>
          <button
            onClick={() => setActiveSubTab('dictionary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'dictionary' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dictionary
          </button>
          <button
            onClick={() => setActiveSubTab('mindmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'mindmap' ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mind Map
          </button>
          <button
            onClick={() => setActiveSubTab('scanner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'scanner' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Scanner
          </button>
        </div>
      </div>

      {/* 1. FLASHCARDS TAB */}
      {activeSubTab === 'flashcards' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-fuchsia-400" />
              <span>Spaced Repetition Deck ({flashcards.length} cards)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Card {cardIndex + 1} of {flashcards.length}
            </span>
          </div>

          <div className="max-w-xl mx-auto space-y-4">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[220px] rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-700/80 p-6 flex flex-col justify-between cursor-pointer shadow-xl hover:border-fuchsia-500/50 transition-all group"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-fuchsia-400 text-[10px]">
                  {isFlipped ? 'Answer (Click to Flip)' : 'Question (Click to Flip)'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
                  Leitner Box {flashcards[cardIndex].box} / 5
                </span>
              </div>

              <div className="my-auto py-4 text-center">
                <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                  {isFlipped ? flashcards[cardIndex].back : flashcards[cardIndex].front}
                </p>

                {!isFlipped && showHint && flashcards[cardIndex].hint && (
                  <p className="text-xs text-amber-300 mt-3 italic bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    💡 Hint: {flashcards[cardIndex].hint}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                {!isFlipped && flashcards[cardIndex].hint ? (
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

            {/* Leitner Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleCardReview(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Needs Review (Reset to Box 1)</span>
              </button>
              <button
                onClick={() => handleCardReview(true)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mastered (Box {Math.min(5, flashcards[cardIndex].box + 1)})</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-2 pt-1">
              <button
                onClick={() => {
                  setCardIndex((prev) => Math.max(0, prev - 1));
                  setIsFlipped(false);
                }}
                disabled={cardIndex === 0}
                className="flex items-center gap-1 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => {
                  setCardIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
                  setIsFlipped(false);
                }}
                disabled={cardIndex === flashcards.length - 1}
                className="flex items-center gap-1 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. QUIZ TAB */}
      {activeSubTab === 'quiz' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-fuchsia-400" />
              <span>Practice Assessment ({quizQuestions.length} questions)</span>
            </h3>
            {quizResult && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold font-mono">
                Score: {quizResult.score} / {quizResult.total} ({quizResult.percentage}%) - Grade {quizResult.grade}
              </span>
            )}
          </div>

          <div className="space-y-6">
            {quizQuestions.map((q, idx) => (
              <div key={q.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-mono text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-100">{q.question}</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-8">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[q.id] === optIdx;
                    let style = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850';

                    if (quizResult) {
                      if (optIdx === q.correctIndex) {
                        style = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-medium';
                      } else if (isSelected) {
                        style = 'bg-rose-950/60 border-rose-500 text-rose-200';
                      }
                    } else if (isSelected) {
                      style = 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-200 font-medium';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => !quizResult && setUserAnswers({ ...userAnswers, [q.id]: optIdx })}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center gap-2 ${style}`}
                      >
                        <span className="font-mono text-slate-500">{String.fromCharCode(65 + optIdx)}.</span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {quizResult && (
                  <div className="mt-2 ml-8 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    <span className="font-bold text-fuchsia-400">Explanation: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Answer questions and submit for immediate automated grading.
            </span>
            <button
              onClick={handleScoreQuiz}
              disabled={Object.keys(userAnswers).length === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-40"
            >
              {quizResult ? 'Recalculate Score' : 'Submit & Grade Quiz'}
            </button>
          </div>
        </div>
      )}

      {/* 3. FORMULA SHEET TAB */}
      {activeSubTab === 'formulas' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sigma className="w-5 h-5 text-fuchsia-400" />
              <h3 className="text-sm font-bold text-white">Mathematics &amp; Science Formula Reference</h3>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {['All', 'Mathematics', 'Physics', 'Chemistry'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFormulaCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    formulaCategory === cat
                      ? 'bg-fuchsia-600 text-white'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={formulaSearch}
              onChange={(e) => setFormulaSearch(e.target.value)}
              placeholder="Search formulas (e.g. Quadratic, Mirror, Joule)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFormulas.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{item.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300">
                    {item.category}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center font-mono text-sm sm:text-base font-bold text-emerald-300">
                  {item.formula}
                </div>
                <p className="text-xs text-slate-300">{item.explanation}</p>
                <div className="text-[11px] text-slate-500 font-mono">
                  <span className="font-semibold text-slate-400">Where: </span>
                  {item.variables}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. STUDENT DICTIONARY TAB */}
      {activeSubTab === 'dictionary' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BookA className="w-5 h-5 text-fuchsia-400" />
              <h3 className="text-sm font-bold text-white">Student Academic Dictionary &amp; Tamil Meanings</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">{DICTIONARY_COLLECTION.length} Words Curated</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={dictionarySearch}
              onChange={(e) => setDictionarySearch(e.target.value)}
              placeholder="Search words (e.g. Mitochondria, Refraction, Catalyst, சமநிலை)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWords.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-sm font-bold text-white">{item.word}</h4>
                    <span className="text-xs font-mono text-slate-400">{item.phonetic}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 italic">
                    {item.partOfSpeech}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.definition}</p>

                {item.tamilMeaning && (
                  <p className="text-xs text-emerald-400 font-medium">
                    தமிழ்: {item.tamilMeaning}
                  </p>
                )}

                <p className="text-[11px] text-slate-400 italic bg-slate-900/70 p-2 rounded-lg border border-slate-800/80">
                  "{item.example}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. VISUAL MIND MAP TAB */}
      {activeSubTab === 'mindmap' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-fuchsia-400" />
              <h3 className="text-sm font-bold text-white">Visual Topic Mind Map: Life Processes</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Interactive Biological Hierarchy</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-6">
            {/* Root Central Node */}
            <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 text-center">
              🌿 Life Processes (Class 10 Biology)
            </div>

            {/* Branches Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
              {[
                { title: '1. Nutrition', desc: 'Autotrophic (Photosynthesis) vs Heterotrophic (Holozoic, Saprophytic)' },
                { title: '2. Respiration', desc: 'Aerobic (Mitochondria / 38 ATP) vs Anaerobic (Yeast / Lactic Acid)' },
                { title: '3. Transportation', desc: 'Heart (Double Circulation) • Xylem (Water) & Phloem (Food Translocation)' },
                { title: '4. Excretion', desc: 'Nephron structure, Glomerular filtration, Bowman capsule & Urine formation' },
              ].map((branch, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2 hover:border-emerald-500/40 transition-colors">
                  <h5 className="text-xs font-bold text-white">{branch.title}</h5>
                  <p className="text-[11px] text-slate-400 leading-snug">{branch.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. AI DOCUMENT SCANNER TAB */}
      {activeSubTab === 'scanner' && <ImageScanner />}
    </div>
  );
};
