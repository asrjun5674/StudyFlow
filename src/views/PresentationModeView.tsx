import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Target,
  Brain,
  Lightbulb,
  Heart,
  Layers,
  Cpu,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Shield,
  Smartphone,
  BookOpen,
  Volume2,
} from 'lucide-react';
import { NavigationSection } from '../types';
import { StorageManager } from '../utils/storage';
import { useTheme } from '../utils/themeContext';
import { StudyFlowLogo } from '../components/StudyFlowLogo';

interface PresentationModeViewProps {
  onNavigate: (section: NavigationSection) => void;
  onReloadData?: () => void;
}

export const PresentationModeView: React.FC<PresentationModeViewProps> = ({
  onNavigate,
  onReloadData,
}) => {
  const { themeConfig } = useTheme();
  const [activeSlide, setActiveSlide] = useState<
    'overview' | 'problem' | 'solution' | 'innovation' | 'architecture' | 'impact'
  >('overview');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetToDemo = () => {
    StorageManager.resetAllData();
    setResetSuccess(true);
    if (onReloadData) {
      onReloadData();
    }
    setTimeout(() => setResetSuccess(false), 2500);
  };

  const slides = [
    { id: 'overview', title: '1. Overview', icon: Award },
    { id: 'problem', title: '2. Problem Statement', icon: Target },
    { id: 'solution', title: '3. Solution & Ecosystem', icon: Lightbulb },
    { id: 'innovation', title: '4. AI Innovation', icon: Brain },
    { id: 'architecture', title: '5. Architecture & Tech', icon: Cpu },
    { id: 'impact', title: '6. Student & Social Impact', icon: Heart },
  ] as const;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Banner with Official StudyFlow Logo */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/40 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <StudyFlowLogo variant="icon" size="md" glow={true} animate={true} />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                PuThulir 3.0 • Student Innovation Showcase
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                StudyFlow: Plan • Learn • Grow
              </h1>
              <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
                An all-in-one, bilingual, AI-powered student productivity &amp; wellbeing platform built to alleviate academic stress, build steady study habits, and provide instant bilingual academic tutoring.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResetToDemo}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${resetSuccess ? 'animate-spin' : ''}`} />
              <span>{resetSuccess ? 'Demo Data Seeded!' : 'Seed Demo Data'}</span>
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg shadow-emerald-500/25"
            >
              <span>Explore Live Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80 overflow-x-auto pb-1 scrollbar-none">
          {slides.map((s) => {
            const Icon = s.icon;
            const isActive = activeSlide === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSlide(s.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slide 1: Overview */}
      {activeSlide === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Project Vision &amp; Core Pillars
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Modern school and pre-university students juggle multiple fractured tools: paper diaries, multiple separate timer apps, chat bots without academic grounding, distracting social video platforms for background music, and anxiety-inducing exam deadlines.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
                  <div className="text-2xl mb-1">📅</div>
                  <h3 className="font-bold text-sm text-emerald-300">1. PLAN</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Structured daily/weekly timetables, homework boards, exam countdowns, and automated Leitner recall schedules.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-teal-950/20 border border-teal-500/20">
                  <div className="text-2xl mb-1">🧠</div>
                  <h3 className="font-bold text-sm text-teal-300">2. LEARN</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    StudyFlowz AI companion powered by Google Gemini with bilingual support (English &amp; தமிழ்), document OCR, quizzes, and formula sheets.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
                  <div className="text-2xl mb-1">🌱</div>
                  <h3 className="font-bold text-sm text-cyan-300">3. GROW</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Integrated wellbeing with 4-4-4-4 Box Breathing, desk stretches, hydration goals, mood tracking, and zero-distraction ambient soundscapes.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6">
              <h3 className="text-base font-bold text-white mb-3">Key Differentiators</h3>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero Distraction Environment:</strong> Clean Web Audio synthesized nature sounds (rain, forest, campfire) directly in-browser with sleep timers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Tamil &amp; English Bilingual AI:</strong> Empowers vernacular and ESL students to ask complex math and science questions in their native language.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Safe &amp; Private by Design:</strong> Secure server proxy for Gemini API calls, client-side storage, and strict educational safety boundaries.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Nav Card */}
          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Explore Sections Live</h3>
            <p className="text-xs text-slate-400">
              Click any of the core modules below to test its interactive functionality in real time:
            </p>
            <div className="space-y-2">
              {[
                { name: 'My Day Dashboard', section: 'home' as NavigationSection, desc: 'Overview, timetable, streak' },
                { name: 'Study Planner', section: 'planner' as NavigationSection, desc: 'Kanban tasks, exams, calendar' },
                { name: 'Focus Pomodoro', section: 'focus' as NavigationSection, desc: 'Timer with chime & presets' },
                { name: 'StudyFlowz AI', section: 'ai' as NavigationSection, desc: 'Voice, text, English & Tamil' },
                { name: 'Study Tools', section: 'tools' as NavigationSection, desc: 'Leitner cards, quiz, OCR scanner' },
                { name: 'Wellbeing Sanctuary', section: 'wellbeing' as NavigationSection, desc: 'Breathing, stretches, water' },
                { name: 'Progress Analytics', section: 'progress' as NavigationSection, desc: 'Focus graphs, mastery rate' },
              ].map((item) => (
                <button
                  key={item.section}
                  onClick={() => onNavigate(item.section)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Slide 2: Problem Statement */}
      {activeSlide === 'problem' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-slate-900/70 border border-red-500/20 p-6 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">The Student Productivity Crisis</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Students face unprecedented cognitive overload from fragmented homework tools, digital distractions, and examination anxiety.
            </p>
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <h4 className="text-xs font-bold text-red-400">1. Tool Fragmentation</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Students bounce between note apps, phone timers, calendar reminders, and YouTube music, losing up to 23 minutes every time they context-switch.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <h4 className="text-xs font-bold text-red-400">2. Vernacular Learning Barrier</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Most existing AI homework helpers only handle English. Vernacular students (e.g. Tamil medium) lack accessible, gentle step-by-step tutoring.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <h4 className="text-xs font-bold text-red-400">3. Burnout &amp; Lack of Self-Care</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Standard productivity apps are harsh corporate to-do lists that overlook mental health, hydration, screen fatigue, and anxiety management.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/70 border border-emerald-500/20 p-6 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">The StudyFlow Answer</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              A single unified ecosystem that combines structured academic planning with an empathetic AI tutor and evidence-backed wellbeing habits.
            </p>
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <h4 className="text-xs font-bold text-emerald-400">1. Unified Student Workspace</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Timetable, homework, exam countdowns, notes, flashcards, and Pomodoro timer all operate within one synchronized context.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <h4 className="text-xs font-bold text-emerald-400">2. StudyFlowz AI Tutor</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Powered by Google Gemini with dual-language fluency (English &amp; தமிழ்), voice input/output, and visual problem solving from scanned notes.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <h4 className="text-xs font-bold text-emerald-400">3. Holistic Growth &amp; Calming Aesthetics</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Whimsical Ghibli-inspired pastel themes, box breathing, desk stretches, water tracking, and synthesized nature sounds to nurture calm minds.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide 3: Solution & Ecosystem */}
      {activeSlide === 'solution' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6">
            <h2 className="text-xl font-bold text-white mb-2">The Complete 13-Module Architecture</h2>
            <p className="text-sm text-slate-400 mb-6">
              Every feature of StudyFlow connects seamlessly to form an all-in-one student sanctuary.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'My Day Dashboard', desc: 'Real-time overview of today timetable, streak, quick tasks, and exam countdowns.' },
                { title: 'Study Planner', desc: 'Daily/weekly timetable with subject color-coding, priorities, and deadlines.' },
                { title: 'Focus Mode', desc: 'Customizable 25/5/15 Pomodoro timer with progress ring and session logger.' },
                { title: 'StudyFlowz AI', desc: 'Empathetic academic doubt clearance with voice recognition and speech synthesis.' },
                { title: 'Music & Ambience', desc: 'Browser-synthesized rain, forest, cafe sounds plus Spotify focus playlists.' },
                { title: 'Subjects & Curriculum', desc: 'Syllabus chapters, notes count, teacher details, and completion percentages.' },
                { title: 'Markdown Notes', desc: 'Rich notes with tags, pinned items, search, and AI-powered summarization.' },
                { title: 'Study Tools', desc: '5-box Leitner spaced repetition flashcards, quizzes, formula bank, and dictionary.' },
                { title: 'Smart Alarms', desc: 'Study, exam, homework, and bedtime reminders with browser notification support.' },
                { title: 'Wellbeing Sanctuary', desc: '4-4-4-4 Box Breathing visualizer, desk yoga stretches, and hydration tracker.' },
                { title: 'Progress Analytics', desc: 'Weekly focus charts, subject mastery breakdown, and achievement milestones.' },
                { title: '7 Themes & Wallpapers', desc: 'Mint Green, Lavender, Peach, Sky Blue, Sunset, Ghibli Pastel, and Dark Mode.' },
              ].map((mod, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-850 hover:border-emerald-500/30 transition-all">
                  <div className="text-emerald-400 font-mono text-xs font-bold mb-1">0{idx + 1}</div>
                  <h4 className="text-sm font-bold text-white mb-1">{mod.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{mod.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Slide 4: AI Innovation */}
      {activeSlide === 'innovation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-slate-900/70 border border-emerald-500/20 p-6 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Google Gemini Integration</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              StudyFlow leverages the Google Gemini TypeScript SDK through a protected Express server proxy for security, low latency, and student safety.
            </p>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-emerald-400">Multi-Modal Document OCR &amp; Analysis</span>
                <p className="text-xs text-slate-400 mt-1">
                  Students snap or upload pictures of textbook diagrams or handwritten homework. Gemini analyzes the image directly and generates step-by-step explanations.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-emerald-400">English &amp; தமிழ் Vernacular Support</span>
                <p className="text-xs text-slate-400 mt-1">
                  Full dual-language prompt engineering ensures culturally relevant explanations in simple Tamil and clear English without complex jargon.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-emerald-400">Voice-to-Voice Oral Tutoring</span>
                <p className="text-xs text-slate-400 mt-1">
                  Hands-free studying using Web Speech Recognition and SpeechSynthesis, with WebSocket Live Voice architecture for instant bidirectional audio.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/70 border border-teal-500/20 p-6 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Pedagogical Guardrails &amp; Safety</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              AI should not just do the student&apos;s homework for them; it should teach them how to think.
            </p>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-teal-300">Socratic Guided Questioning</span>
                <p className="text-xs text-slate-400 mt-1">
                  When a student asks for a math answer, the AI breaks down the formula, identifies the first step, and guides the student to solve it themselves.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-teal-300">Strict Educational Boundaries</span>
                <p className="text-xs text-slate-400 mt-1">
                  Filters inappropriate prompts, prevents medical diagnoses or unverified advice, and provides encouraging feedback adapted for school ages.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-teal-300">Zero Hallucination Honesty</span>
                <p className="text-xs text-slate-400 mt-1">
                  If backend API credentials are not yet configured, the system provides transparent setup guidance instead of fabricating misleading facts.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide 5: Architecture & Tech */}
      {activeSlide === 'architecture' && (
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-6">
          <h2 className="text-xl font-bold text-white">Technical Architecture &amp; Engineering Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Frontend Layer</div>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• <strong>React 19 &amp; Vite:</strong> Blazing-fast responsive SPA with strict modular components.</li>
                <li>• <strong>Tailwind CSS 4:</strong> Dynamic theme engine with CSS custom variables for 7 unique themes.</li>
                <li>• <strong>Lucide React:</strong> Consistent, accessible iconography.</li>
                <li>• <strong>Web Audio API:</strong> Synthesized pink/brown noise and resonant biquad filters for nature soundscapes.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">Backend &amp; AI Layer</div>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• <strong>Express &amp; Node.js:</strong> Secure proxy routes (`/api/chat`, `/api/deep-thinking`, `/api/analyze-image`).</li>
                <li>• <strong>@google/genai SDK:</strong> Gemini 3.8 Flash with thinking capabilities and multimodal image analysis.</li>
                <li>• <strong>WebSocket Bridge:</strong> Low-latency streaming for Gemini Live bidirectional voice tutoring.</li>
                <li>• <strong>Key Security:</strong> Zero client-side API key leakage.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Persistence &amp; Quality</div>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• <strong>LocalStorage &amp; Seed Engine:</strong> Instant data initialization with backup, restore &amp; reset capabilities.</li>
                <li>• <strong>Decoupled Logic:</strong> 12 automated unit tests verifying Leitner box progression, quiz scoring, and audio codecs.</li>
                <li>• <strong>Accessibility &amp; Responsive:</strong> Full desktop sidebar, tablet layouts, and mobile drawer.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Slide 6: Student & Social Impact */}
      {activeSlide === 'impact' && (
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Social Impact &amp; PuThulir 3.0 Alignment</h2>
              <p className="text-xs text-slate-400">Empowering every learner with accessible, empathetic, and organized study habits.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="text-2xl">🌱</div>
              <h4 className="text-sm font-bold text-white">Equitable Vernacular Access</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Breaking linguistic barriers by providing full Tamil and English support in StudyFlowz AI, allowing students from any educational board to understand complex formulas without hesitation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="text-2xl">🧘</div>
              <h4 className="text-sm font-bold text-white">Mental Health &amp; Stress Relief</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Replaces high-pressure study marathons with mindful Pomodoro intervals, calming 4-4-4-4 box breathing animations, desk yoga stretches, and hydration tracking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="text-2xl">📈</div>
              <h4 className="text-sm font-bold text-white">Long-Term Habit Formation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Encourages steady daily streaks, visual mastery meters for each academic subject, and Leitner spaced repetition flashcards that ensure long-term memory retention for board examinations.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-emerald-300">Ready to see StudyFlow in action?</div>
              <div className="text-xs text-slate-400">Test live features across all 13 integrated sections now.</div>
            </div>
            <button
              onClick={() => onNavigate('home')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold text-xs sm:text-sm cursor-pointer transition-all shadow-lg shadow-emerald-500/20 shrink-0"
            >
              Launch Student Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
