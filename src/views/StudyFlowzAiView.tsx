import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  HelpCircle,
  Brain,
  ShieldCheck,
  Check,
  Copy,
  Languages,
  Radio,
  MessageSquare,
  Heart,
  Flame,
  ArrowRight,
  Globe,
  Crown,
} from 'lucide-react';
import { VoiceTutor } from '../components/VoiceTutor';
import { StudyFlowLogo } from '../components/StudyFlowLogo';
import { NavigationSection, PlanTier } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface StudyFlowzAiViewProps {
  planTier?: PlanTier;
  onNavigate?: (section: NavigationSection) => void;
}

export const StudyFlowzAiView: React.FC<StudyFlowzAiViewProps> = ({
  planTier = 'free',
  onNavigate,
}) => {
  const [activeMode, setActiveMode] = useState<'voice' | 'chat'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('aiMode') === 'chat') return 'chat';
    }
    return 'voice'; // Default to real-time Live Voice conversation
  });

  const [aiModelMode, setAiModelMode] = useState<'flash' | 'argon_thinking'>(() =>
    planTier === 'plus' || planTier === 'pro_ultra' ? 'argon_thinking' : 'flash'
  );
  const hasProAi = planTier === 'plus' || planTier === 'pro_ultra';

  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  const [selectedSubject, setSelectedSubject] = useState<'General' | 'Mathematics' | 'Science' | 'English' | 'Social Science'>('General');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const initialWelcome = language === 'ta'
    ? 'வணக்கம்! நான் StudyFlowz, உங்கள் நண்பன் மற்றும் கல்வி வழிகாட்டி. நான் தமிழ் மற்றும் ஆங்கிலம் (English & Tamil) ஆதரிக்கிறேன், ஆனால் உலகின் அனைத்து மொழிகளையும் என்னால் புரிந்துகொண்டு உதவ முடியும்! நீங்கள் தனியாகப் படிக்கும்போது சோர்வாகவோ, தனிமையாகவோ உணர்ந்தால் என்னிடம் பேசுங்கள். என்ன படிக்கலாம்?'
    : "Hello! I'm StudyFlowz, your friendly AI companion and study buddy! I have English and Tamil supported (and I can understand and converse in all languages of the world!). Whether you are stuck on a tough concept, preparing for exams, or feeling lonely and tired during late-night study hours—I'm right here with you. What shall we explore together?";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: initialWelcome,
      timestamp: 'Ready',
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Speech Recognition (Mic Input for text box)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          role: 'model',
          content: 'Voice-to-text dictation is not supported in this browser. You can type your doubt in the message box below!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  // Text-To-Speech (AI Voice Output)
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'ta' ? 'ta-IN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    stopSpeaking();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setLoading(true);

    try {
      const systemInstruction = `You are StudyFlowz, a compassionate, lively, warm, and brilliant personal study companion and tutor designed for school and college students.
Subject focus: ${selectedSubject}.

MULTILINGUAL CAPABILITIES & STATED SUPPORT (MANDATORY REQUIREMENT):
- You know, comprehend, and can converse in ALL languages in the world (such as French, Spanish, German, Hindi, Telugu, Malayalam, Kannada, Arabic, Mandarin, Japanese, Russian, etc.). You can understand and assist any student in whatever language they write to you in.
- STATED SUPPORT RULE: Whenever you introduce yourself, list your capabilities, or when asked what languages you support, you MUST explicitly state that you have English and Tamil supported (e.g. "I have English and Tamil supported, but I can understand and help you in any language in the world!").
- Current language mode: ${language === 'ta' ? 'Respond primarily in clear, warm, grammatically sound Tamil (தமிழ்) with English technical terms in brackets where helpful for academic clarity.' : 'Respond in encouraging, clear English suitable for students, avoiding overly dense jargon unless explained.'}

Emotional companionship:
- When the student feels lonely, tired, isolated, or overwhelmed, validate their emotions with genuine warmth, companionship, and uplifting encouragement ("I am right here with you! You are doing great, and you never have to face this alone.").
- Provide quick, lively, clear answers.
Pedagogy:
- Break math and physics problems down into numbered step-by-step deductions.
- Use simple real-world analogies.
- Emphasize safety, constructive learning habits, and positive encouragement.`;

      const useDeepArgon = aiModelMode === 'argon_thinking' && hasProAi;
      const endpoint = useDeepArgon ? '/api/deep-thinking' : '/api/chat';
      const payload = useDeepArgon
        ? {
            prompt: text,
            subject: selectedSubject,
            detailLevel: 'thorough',
          }
        : {
            messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
            systemInstruction,
            model: hasProAi ? 'gemini-4-argon' : 'gemini-3.8-flash',
            thinkingMode: hasProAi,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get StudyFlowz response');
      }

      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: useDeepArgon ? data.solution || data.reply : data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || (useDeepArgon ? 'gemini-4-argon' : 'gemini-3.8-flash'),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      console.error('StudyFlowz error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          content: `⚠️ Oops! I couldn't reach the server right now (${err.message}). Please check that your network is connected and Gemini API key is configured in Settings.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const starterPrompts = language === 'ta'
    ? [
        { label: 'ஆதரிக்கப்படும் மொழிகள்', text: 'நீங்கள் எந்தெந்த மொழிகளை ஆதரிக்கிறீர்கள்?' },
        { label: 'தனிமை & ஊக்கம்', text: 'நான் தனியாகப் படிக்கும்போது சோர்வாகவும் தனிமையாகவும் உணர்கிறேன். எனக்கு ஊக்கமளிக்கவும்.' },
        { label: 'கணிதம்', text: 'முக்கோணவியல் (Trigonometry) சூத்திரங்களை எப்படி எளிதாக நினைவில் வைத்துக்கொள்வது?' },
        { label: 'அறிவியல்', text: 'ஒளிச்சேர்க்கை (Photosynthesis) செயல்முறையை எளிய தமிழில் விளக்கு.' },
      ]
    : [
        { label: 'Supported Languages', text: 'What languages do you support?' },
        { label: 'Feeling Lonely', text: "I'm feeling lonely and tired studying by myself tonight. Can you keep me company and motivate me?" },
        { label: 'Energy Boost', text: 'I have a big study session ahead and my motivation is dipping. Give me an inspiring pep talk!' },
        { label: 'Math Step-by-Step', text: 'Can you show me how to solve 2x² - 7x + 3 = 0 step by step using factoring?' },
      ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Segmented Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800/80">
          <button
            onClick={() => setActiveMode('voice')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeMode === 'voice'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className={`w-4 h-4 ${activeMode === 'voice' ? 'text-slate-950 animate-pulse' : 'text-emerald-400'}`} />
            <span>Live Voice Conversation</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950/20 text-slate-900 font-mono font-bold">
              Gemini 3.8 Live
            </span>
          </button>

          <button
            onClick={() => setActiveMode('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeMode === 'chat'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat &amp; Doubt Solver</span>
          </button>
        </div>

        {/* Companionship Subtitle & Language Status */}
        <div className="flex items-center gap-3 px-2 text-xs text-slate-400">
          <StudyFlowLogo variant="icon" size="xs" glow={false} />
          <span className="flex items-center gap-1 text-emerald-400">
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            Empathetic Companion &amp; Study Partner
          </span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline text-emerald-300 font-medium flex items-center gap-1">
            <Globe className="w-3 h-3 text-emerald-400" />
            English &amp; தமிழ் Supported (Understands All World Languages)
          </span>
        </div>
      </div>

      {/* Mode 1: Live Voice Conversation (Gemini 3.8 Live) */}
      {activeMode === 'voice' ? (
        <VoiceTutor onSwitchToChat={() => setActiveMode('chat')} />
      ) : (
        /* Mode 2: Multi-Turn Bilingual Chat Tutor */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-500/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start sm:items-center gap-4">
              <StudyFlowLogo variant="icon" size="md" glow={true} animate={true} />
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-500/30">
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  StudyFlowz Chat • English &amp; தமிழ் Supported
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Ask StudyFlowz Anything!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Your patient, supportive study buddy. Officially supports English and Tamil, with universal understanding of all world languages. Ask homework doubts or talk when you feel tired.
                </p>
              </div>
            </div>

            {/* Controls: Language, Gemini Pro Mode & Subject Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setAiModelMode('flash')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    aiModelMode === 'flash'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Gemini 3.8 Flash
                </button>
                <button
                  onClick={() => {
                    if (hasProAi) {
                      setAiModelMode('argon_thinking');
                    } else {
                      onNavigate?.('pro');
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    aiModelMode === 'argon_thinking' && hasProAi
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-amber-300 hover:text-amber-200'
                  }`}
                  title={hasProAi ? 'Gemini 4 Argon Deep Thinking STEM Engine' : 'Unlock Gemini 4 Argon Deep Thinking via UPI'}
                >
                  <Crown className="w-3 h-3" />
                  <span>{hasProAi ? 'Gemini 4 Pro Think' : 'Unlock Pro AI (UPI)'}</span>
                </button>
              </div>

              <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('ta')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    language === 'ta'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  தமிழ் (Tamil)
                </button>
              </div>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="General">General / All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science &amp; Physics</option>
                <option value="English">English Grammar &amp; Lit</option>
                <option value="Social Science">Social Science</option>
              </select>
            </div>
          </div>

          {/* Switch to Voice Prompt Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-950/30 to-teal-950/20 border border-emerald-500/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Prefer talking hands-free?</h4>
                <p className="text-[11px] text-slate-400">
                  Switch to Live Voice Companion for real-time conversational spoken banter with zero delay!
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveMode('voice')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition-all shadow-md"
            >
              <span>Launch Live Voice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Chat Conversation Stage */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col h-[560px] shadow-xl overflow-hidden">
            {/* Messages Thread */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-base">
                        🤖
                      </div>
                    )}

                    <div
                      className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-md'
                          : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400 mb-1.5 pb-1 border-b border-white/10">
                        <span className="font-semibold text-slate-300">
                          {isUser ? 'You' : 'StudyFlowz'}
                        </span>

                        <div className="flex items-center gap-2">
                          {!isUser && (
                            <>
                              <button
                                onClick={() => speakText(msg.content)}
                                className="p-1 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                                title={isSpeaking ? 'Stop speaking' : 'Read aloud with Text-to-Speech'}
                                aria-label="Read response aloud"
                              >
                                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                onClick={() => handleCopy(msg.id, msg.content)}
                                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title="Copy text"
                                aria-label="Copy response text"
                              >
                                {copiedId === msg.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </>
                          )}
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>

                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-base">
                        🌱
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-3 items-center text-slate-400 text-xs pl-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>StudyFlowz is thinking and structuring explanation...</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* Quick starter questions & Anti-Loneliness prompts */}
            <div className="px-4 py-2.5 bg-slate-950/70 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
              <span className="text-[10px] uppercase font-bold text-emerald-400 shrink-0">Try:</span>
              {starterPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.text)}
                  className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-slate-300 whitespace-nowrap text-[11px] transition-all cursor-pointer"
                >
                  <span className="text-emerald-400 font-semibold mr-1">[{q.label}]</span>
                  {q.text}
                </button>
              ))}
            </div>

            {/* Input Bar with Mic Input & Send */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                  title={isListening ? 'Listening... click to stop' : 'Click to speak your question'}
                  aria-label={isListening ? 'Stop listening' : 'Speak doubt with microphone'}
                >
                  {isListening ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    isListening
                      ? 'Listening to your voice...'
                      : language === 'ta'
                      ? 'StudyFlowz இடம் உங்கள் சந்தேகத்தை தமிழில் கேட்கலாம் அல்லது ஊக்கம் பெறலாம்...'
                      : 'Ask StudyFlowz any doubt, or tell how you are feeling...'
                  }
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />

                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-40 transition-all cursor-pointer"
                  aria-label="Send question"
                >
                  <span>Ask</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Privacy & Safety Subtitle */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Student Safe AI • Strict academic focus &amp; empathetic privacy preserved
                </span>
                <span>Official Google Gemini SDK (Server-Side)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
