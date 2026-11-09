import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Flame,
  Lightbulb,
} from 'lucide-react';
import { COMPLEX_THINKING_PROMPTS } from '../data/sampleMaterials';

export const DeepThinkingLab: React.FC = () => {
  const [prompt, setPrompt] = useState(COMPLEX_THINKING_PROMPTS[0].prompt);
  const [activeSubject, setActiveSubject] = useState(COMPLEX_THINKING_PROMPTS[0].subject);
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('gemini-4-argon');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunThinking = async (customPrompt?: string) => {
    const textToRun = customPrompt || prompt;
    if (!textToRun.trim()) return;

    setLoading(true);
    setError(null);
    setSolution(null);

    try {
      const res = await fetch('/api/deep-thinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToRun,
          subject: activeSubject,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete deep thinking analysis');
      }

      setSolution(data.solution);
      if (data.modelUsed) {
        setModelUsed(data.modelUsed);
      }
    } catch (err: any) {
      console.error('Deep thinking error:', err);
      setError(err.message || 'An error occurred during high-thinking reasoning.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!solution) return;
    navigator.clipboard.writeText(solution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-950/20 to-slate-900 border border-amber-600/30 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-500/30">
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              gemini-4-argon • ThinkingLevel.HIGH
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              High-Thinking Deep STEM & Proof Solver
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Handles rigorous academic proofs, Olympiad-level derivations, boundary validations, and theoretical physics using high reasoning depth without token truncation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-amber-200 text-xs font-mono flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Max Reasoning Mode
            </span>
          </div>
        </div>
      </div>

      {/* Preset Problem Selectors */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Select a High-Complexity Challenge or Enter Your Own
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {COMPLEX_THINKING_PROMPTS.map((item, index) => {
            const isSelected = prompt === item.prompt;
            return (
              <button
                key={index}
                onClick={() => {
                  setPrompt(item.prompt);
                  setActiveSubject(item.subject);
                }}
                className={`p-3.5 rounded-xl text-left transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-amber-950/30 border-amber-500 text-white shadow-md shadow-amber-500/10'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide">
                    {item.subject}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <h4 className="text-xs font-bold line-clamp-1 text-slate-100">{item.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {item.prompt}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Problem Input & Submit Area */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div>
          <label htmlFor="problem-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Target Problem / Theorem / STEM Question:
          </label>
          <textarea
            id="problem-input"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the proof, differential equation, physics derivation, or algorithm you need solved rigorously..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors leading-relaxed font-mono"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Configured with ThinkingLevel.HIGH • Full intermediate chain of reasoning</span>
          </div>

          <button
            onClick={() => handleRunThinking()}
            disabled={loading || !prompt.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-sm shadow-lg shadow-amber-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deep Reasoning in Progress...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Execute High-Thinking Derivation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Loading Reasoning Stages Animation */}
      {loading && (
        <div className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Gemini 4 Argon Thinking Engine Active</h3>
              <p className="text-xs text-amber-300/80">Evaluating lemmas, checking constraints, and formulating rigorous proof...</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            {[
              { step: '1', title: 'Axioms & Setup', desc: 'Deconstructing problem variables' },
              { step: '2', title: 'Formal Deduction', desc: 'Step-by-step mathematical steps' },
              { step: '3', title: 'Sanity Checks', desc: 'Boundary & dimensional testing' },
              { step: '4', title: 'Synthesis', desc: 'Intuitive takeaway formulation' },
            ].map((st, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-mono font-bold">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px]">
                    {st.step}
                  </span>
                  <span>{st.title}</span>
                </div>
                <p className="text-slate-400 text-[11px]">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solution Display Card */}
      {solution && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Rigorous Proof & Derivation Complete</h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Model: {modelUsed} • High Thinking Level
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors cursor-pointer border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Solution'}</span>
              </button>
            </div>
          </div>

          {/* Formatted Solution Output */}
          <div className="prose prose-invert max-w-none text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
            {solution}
          </div>
        </div>
      )}
    </div>
  );
};
