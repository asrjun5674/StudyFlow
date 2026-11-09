import React, { useState, useRef } from 'react';
import {
  FileSearch,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Camera,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/sampleMaterials';

export const ImageScanner: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_IMAGES[0].dataUrl);
  const [imageTitle, setImageTitle] = useState<string>(SAMPLE_IMAGES[0].title);
  const [promptInstruction, setPromptInstruction] = useState<string>(SAMPLE_IMAGES[0].recommendedPrompt);
  const [analysisMode, setAnalysisMode] = useState<'detailed_solve' | 'error_check' | 'extract_flashcards'>('detailed_solve');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('gemini-4-argon');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setImageTitle(file.name);
      setAnalysisResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Determine MIME type
      let mimeType = 'image/jpeg';
      if (selectedImage.startsWith('data:image/png')) mimeType = 'image/png';
      else if (selectedImage.startsWith('data:image/webp')) mimeType = 'image/webp';
      else if (selectedImage.startsWith('data:image/svg+xml')) mimeType = 'image/svg+xml';

      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType,
          instruction: promptInstruction,
          mode: analysisMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze image');
      }

      setAnalysisResult(data.analysis);
      if (data.modelUsed) {
        setModelUsed(data.modelUsed);
      }
    } catch (err: any) {
      console.error('Image analysis error:', err);
      setError(err.message || 'Failed to analyze study diagram with Gemini 4 Argon.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-950/40 via-cyan-950/20 to-slate-900 border border-sky-600/30 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-sky-500/30">
              <FileSearch className="w-3.5 h-3.5 text-sky-400" />
              gemini-4-argon Multimodal Vision
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Visual Notes & Diagram Intelligence
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Upload textbook pages, handwritten calculations, whiteboard sketches, or chemistry/physics diagrams. Gemini 4 Argon examines formulas, validates steps, and diagnoses errors.
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload My Image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Preset Diagram Cards for 1-Click Testing */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Or Test With Curated High-Yield Diagrams:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SAMPLE_IMAGES.map((sample) => {
            const isSelected = selectedImage === sample.dataUrl;
            return (
              <button
                key={sample.id}
                onClick={() => {
                  setSelectedImage(sample.dataUrl);
                  setImageTitle(sample.title);
                  setPromptInstruction(sample.recommendedPrompt);
                  setAnalysisResult(null);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-950/40 border-sky-500 shadow-md shadow-sky-500/10'
                    : 'bg-slate-900/70 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0 flex items-center justify-center p-1">
                  <img src={sample.dataUrl} alt={sample.title} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-sky-400 uppercase">{sample.subject}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 truncate">{sample.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{sample.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace: Image Preview + Analysis Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Image Display & Modes */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 truncate max-w-[240px]">
              {imageTitle}
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Replace</span>
            </button>
          </div>

          {/* Visual Container */}
          <div className="w-full h-64 rounded-xl border border-slate-800 bg-slate-950/80 p-2 flex items-center justify-center overflow-hidden">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Uploaded study material"
                className="max-h-full max-w-full object-contain rounded"
              />
            ) : (
              <div className="text-center p-6 text-slate-500">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">No image selected</p>
              </div>
            )}
          </div>

          {/* Analysis Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Analysis Objective:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'detailed_solve', label: 'Solve & Explain', icon: Sparkles },
                { id: 'error_check', label: 'Audit Work', icon: AlertTriangle },
                { id: 'extract_flashcards', label: 'Flashcards', icon: Layers },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setAnalysisMode(m.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    analysisMode === m.id
                      ? 'bg-sky-500/20 border-sky-500 text-sky-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <m.icon className="w-4 h-4" />
                  <span className="text-[11px] font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt instruction customization */}
          <div>
            <label htmlFor="custom-instruction" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Specific Instructions to Gemini 4 Argon:
            </label>
            <textarea
              id="custom-instruction"
              rows={3}
              value={promptInstruction}
              onChange={(e) => setPromptInstruction(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors font-mono"
            />
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={loading || !selectedImage}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Gemini 4 Argon Analyzing Visual Data...</span>
              </>
            ) : (
              <>
                <FileSearch className="w-4 h-4" />
                <span>Analyze with Gemini 4 Argon</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Analysis Results & Breakdown */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Visual Intelligence Report</h3>
              </div>
              {analysisResult && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">Model: {modelUsed}</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer border border-slate-700"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs">
                {error}
              </div>
            )}

            {loading && (
              <div className="py-16 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center mx-auto">
                  <FileSearch className="w-6 h-6 text-sky-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Extracting Visual Semantics</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Gemini 4 Argon is reading handwritten equations, chemical structures, and vector notations...
                  </p>
                </div>
              </div>
            )}

            {!loading && !analysisResult && !error && (
              <div className="py-20 text-center text-slate-500 space-y-2">
                <HelpCircle className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-sm">Click "Analyze with Gemini 4 Argon" to inspect this diagram</p>
                <p className="text-xs text-slate-600">Supports handwritten homework, lab charts, geometry, and formulas</p>
              </div>
            )}

            {analysisResult && (
              <div className="mt-4 prose prose-invert max-w-none text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 max-h-[520px] overflow-y-auto">
                {analysisResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
