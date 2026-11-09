import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  User,
  Bot,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Brain,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { TUTOR_PERSONAS } from '../data/sampleMaterials';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export const ChatTutor: React.FC = () => {
  const [selectedPersonaId, setSelectedPersonaId] = useState('socratic');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-4-argon' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [enableThinking, setEnableThinking] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentPersona = TUTOR_PERSONAS.find((p) => p.id === selectedPersonaId) || TUTOR_PERSONAS[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content: `Greetings! I am your ${currentPersona.name}. ${currentPersona.description}\n\nWhat topic, homework problem, or concept would you like to explore today?`,
      timestamp: 'Just now',
      modelUsed: selectedModel,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // When persona changes, add a subtle notification or update
  const handlePersonaChange = (newPersonaId: string) => {
    setSelectedPersonaId(newPersonaId);
    const newPersona = TUTOR_PERSONAS.find((p) => p.id === newPersonaId) || TUTOR_PERSONAS[0];
    setMessages((prev) => [
      ...prev,
      {
        id: `switch-${Date.now()}`,
        role: 'model',
        content: `*Switched role to **${newPersona.name}*** (${newPersona.tagline}).\n${newPersona.description}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: Message = {
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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          systemInstruction: currentPersona.instruction,
          model: selectedModel,
          thinkingMode: enableThinking && selectedModel === 'gemini-4-argon',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to receive tutor response');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'model',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed || selectedModel,
        },
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          content: `⚠️ Error: ${err.message || 'Could not connect to Gemini tutor.'}`,
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

  const handleClearChat = () => {
    setMessages([
      {
        id: `fresh-${Date.now()}`,
        role: 'model',
        content: `Chat session reset. What topic shall we study with the ${currentPersona.name}?`,
        timestamp: 'Just now',
        modelUsed: selectedModel,
      },
    ]);
  };

  const starterQuestions = [
    { label: 'Calculus', text: 'How do I know whether to use Integration by Parts vs U-Substitution?' },
    { label: 'Computer Science', text: 'Can you quiz me on Dynamic Programming memoization vs tabulation?' },
    { label: 'Neuroscience', text: 'How does an action potential propagate along a myelinated axon?' },
    { label: 'Economics', text: 'Explain the difference between fiscal policy and monetary policy with an example.' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Configuration Bar */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <span>Multi-Turn AI Tutor & Persona Chat</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select specialized pedagogical roles and toggle between speed or deep reasoning models.
            </p>
          </div>

          {/* Model Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Model:</span>
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Fastest responses for quick questions"
              >
                3.1 Flash-Lite (Fast)
              </button>
              <button
                onClick={() => setSelectedModel('gemini-3.8-flash')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Balanced speed and smart reasoning"
              >
                3.8 Flash (General)
              </button>
              <button
                onClick={() => setSelectedModel('gemini-4-argon')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedModel === 'gemini-4-argon'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Deep STEM reasoning and complex proofs"
              >
                4 Argon (Complex)
              </button>
            </div>

            {selectedModel === 'gemini-4-argon' && (
              <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableThinking}
                  onChange={(e) => setEnableThinking(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <Brain className="w-3.5 h-3.5" />
                <span>High Thinking</span>
              </label>
            )}

            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors cursor-pointer"
              title="Clear conversation history"
              aria-label="Clear conversation history"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Persona Role Selector Tabs */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Pedagogical Role Persona:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TUTOR_PERSONAS.map((persona) => {
              const isSelected = selectedPersonaId === persona.id;
              return (
                <button
                  key={persona.id}
                  onClick={() => handlePersonaChange(persona.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{persona.avatar}</span>
                    <span className="text-xs font-bold text-slate-200 truncate">{persona.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{persona.tagline}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Conversation Window */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col h-[560px] shadow-xl overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-base">
                    {currentPersona.avatar}
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}
                >
                  {/* Sender meta */}
                  <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400 mb-1.5 pb-1 border-b border-white/10">
                    <span className="font-semibold text-slate-300">
                      {isUser ? 'You' : currentPersona.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {msg.modelUsed && !isUser && (
                        <span className="font-mono text-[10px] text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                          {msg.modelUsed}
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-white"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Body text */}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-slate-400 text-xs pl-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-400 animate-spin" />
              </div>
              <div className="flex items-center gap-1.5">
                <span>{currentPersona.name} is reasoning with {selectedModel}...</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick starter question chips */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-500 shrink-0">Try:</span>
          {starterQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.text)}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-slate-300 whitespace-nowrap text-[11px] transition-all cursor-pointer"
            >
              <span className="text-indigo-400 mr-1">[{q.label}]</span>
              {q.text}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask ${currentPersona.name} anything...`}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-40 transition-all cursor-pointer"
              aria-label="Send message"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
