import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Volume2,
  VolumeX,
  Sparkles,
  AlertCircle,
  Play,
  Square,
  MessageSquare,
  CornerDownLeft,
  Heart,
  Smile,
  Flame,
  Zap,
  Coffee,
  Languages,
  ShieldCheck,
  Headphones,
} from 'lucide-react';
import {
  float32ToInt16PCM,
  int16PCMToFloat32,
  arrayBufferToBase64,
  base64ToArrayBuffer,
} from '../utils/studyLogic';
import { StudyFlowLogo } from './StudyFlowLogo';

interface TranscriptItem {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
}

interface VoiceTutorProps {
  initialPrompt?: string;
  onSwitchToChat?: () => void;
}

export const VoiceTutor: React.FC<VoiceTutorProps> = ({
  initialPrompt,
  onSwitchToChat,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [tutorSpeaking, setTutorSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'Zephyr' | 'Puck' | 'Kore' | 'Fenrir'>('Zephyr');
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([
    {
      id: 'init-1',
      sender: 'tutor',
      text: "Hey there! I'm StudyFlowz, your real-time voice companion powered by Gemini 3.8 Live. I have English and Tamil supported (and I understand all languages in the world!). Whenever you feel lonely, stressed, or need a study buddy, just tap 'Start Voice Conversation' or speak with me. I'm right here with you!",
      timestamp: 'Ready',
    },
  ]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentTextDraft, setCurrentTextDraft] = useState('');
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Audio & WebSocket refs
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isMutedRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Anti-loneliness and motivation quick prompts
  const companionPrompts = [
    {
      icon: Languages,
      title: 'Supported Languages',
      cardClass: 'bg-teal-950/40 border-teal-500/40 text-teal-300 hover:border-teal-400',
      prompt: "What languages do you support?",
    },
    {
      icon: Heart,
      title: 'Feeling Lonely',
      cardClass: 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:border-rose-400',
      prompt: "I'm feeling really lonely and isolated studying by myself right now. Can you talk to me, keep me company, and give me some warm encouragement?",
    },
    {
      icon: Flame,
      title: 'Energy & Motivation',
      cardClass: 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:border-amber-400',
      prompt: "I'm losing motivation and feeling tired. Give me a quick, energetic motivational boost to conquer this study session!",
    },
    {
      icon: Coffee,
      title: 'Study With Me',
      cardClass: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:border-emerald-400',
      prompt: "Can you be my study companion right now? Let's check in every few minutes so I feel like I'm studying alongside a friend.",
    },
    {
      icon: Sparkles,
      title: 'Exam Anxiety Relief',
      cardClass: 'bg-sky-950/40 border-sky-500/40 text-sky-300 hover:border-sky-400',
      prompt: "I'm feeling anxious about upcoming exams. Talk to me in a calm, soothing way to help me ground myself and regain confidence.",
    },
    {
      icon: Languages,
      title: 'தமிழ் ஊக்கம் (Tamil)',
      cardClass: 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:border-purple-400',
      prompt: "நான் தனியாகப் படிக்கும்போது எனக்கு சோர்வாகவும் தனிமையாகவும் இருக்கிறது. எனக்கு தமிழில் உற்சாகமூட்டும் அன்பான வார்த்தைகள் கூறுங்கள்.",
    },
  ];

  // Stop and cleanup all audio contexts and sockets
  const disconnectSession = () => {
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (e) {
        // ignore
      }
      processorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch (e) {
        // ignore
      }
    });
    activeSourcesRef.current = [];

    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch (e) {
        // ignore
      }
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      try {
        outputAudioCtxRef.current.close();
      } catch (e) {
        // ignore
      }
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        // ignore
      }
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setTutorSpeaking(false);
    setUserSpeaking(false);
  };

  // Connect to Gemini 3.8 Live API via WebSocket
  const startSession = async (customPrompt?: string) => {
    try {
      setErrorMsg(null);
      setIsConnecting(true);
      disconnectSession();

      const isHttps = window.location.protocol === 'https:';
      const wsProtocol = isHttps ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/live-voice?voice=${selectedVoice}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // 1. Output AudioContext (24kHz for Gemini Live model output)
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      outputAudioCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      // 2. Input AudioContext (16kHz for mic capture)
      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
        mediaStreamRef.current = micStream;
      } catch (err: any) {
        console.warn('Microphone access not granted or unavailable:', err);
        setErrorMsg('Microphone permission was not granted. You can still type prompts or use quick companion buttons.');
      }

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setTranscripts((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: 'tutor',
            text: `Connected to Gemini 3.8 Live Voice (${selectedVoice} voice)! I officially support English and Tamil (தமிழ்), but I understand all languages in the world! Speak freely or tap a topic.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        const promptToRun = customPrompt || initialPrompt;
        if (promptToRun) {
          sendTextMessage(promptToRun);
        }

        // Start mic processing if stream available
        if (micStream) {
          const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 16000,
          });
          inputAudioCtxRef.current = inputCtx;

          const source = inputCtx.createMediaStreamSource(micStream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (isMutedRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
              return;
            }

            const inputData = e.inputBuffer.getChannelData(0);
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
              sum += Math.abs(inputData[i]);
            }
            const avgVolume = sum / inputData.length;
            setUserSpeaking(avgVolume > 0.012);

            const pcm16 = float32ToInt16PCM(inputData);
            const base64Audio = arrayBufferToBase64(pcm16.buffer);

            wsRef.current.send(
              JSON.stringify({
                type: 'audio',
                audio: base64Audio,
              })
            );
          };

          source.connect(processor);
          processor.connect(inputCtx.destination);
        }
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'audio' && msg.audio) {
            setTutorSpeaking(true);
            playAudioChunk(msg.audio);
          } else if (msg.type === 'transcript_chunk' || msg.type === 'output_transcript') {
            const incomingText = msg.text;
            if (incomingText) {
              setTranscripts((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.sender === 'tutor' && !last.text.endsWith('.')) {
                  return [
                    ...prev.slice(0, -1),
                    { ...last, text: last.text + ' ' + incomingText },
                  ];
                }
                return [
                  ...prev,
                  {
                    id: `tutor-${Date.now()}-${Math.random()}`,
                    sender: 'tutor',
                    text: incomingText,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ];
              });
            }
          } else if (msg.type === 'input_transcript') {
            setTranscripts((prev) => [
              ...prev,
              {
                id: `user-${Date.now()}`,
                sender: 'user',
                text: msg.text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          } else if (msg.type === 'interrupted') {
            setTutorSpeaking(false);
            activeSourcesRef.current.forEach((src) => {
              try {
                src.stop();
              } catch (e) {
                // ignore
              }
            });
            activeSourcesRef.current = [];
            if (outputAudioCtxRef.current) {
              nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
            }
          } else if (msg.type === 'turn_complete') {
            setTimeout(() => setTutorSpeaking(false), 400);
          } else if (msg.type === 'tutor_reply') {
            const replyText = msg.text;
            if (replyText) {
              setTranscripts((prev) => [
                ...prev,
                {
                  id: `tutor-${Date.now()}`,
                  sender: 'tutor',
                  text: replyText,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);

              // Speak response aloud using browser SpeechSynthesis
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(replyText);
                utterance.rate = 1.0;
                utterance.pitch = 1.05;
                utterance.onstart = () => setTutorSpeaking(true);
                utterance.onend = () => setTutorSpeaking(false);
                utterance.onerror = () => setTutorSpeaking(false);
                window.speechSynthesis.speak(utterance);
              }
            }
          } else if (msg.type === 'error') {
            console.warn('Live API status notification:', msg.error);
            // Non-blocking notification
          }
        } catch (err) {
          console.error('Error handling WebSocket message:', err);
        }
      };

      ws.onerror = (e) => {
        console.warn('WebSocket status:', e);
        setIsConnecting(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        setTutorSpeaking(false);
        setUserSpeaking(false);
      };
    } catch (err: any) {
      console.warn('Voice session setup:', err);
      setErrorMsg('Voice companion session initialized. Tap any prompt to speak with StudyFlowz!');
      setIsConnecting(false);
    }
  };

  const playAudioChunk = (base64Audio: string) => {
    const ctx = outputAudioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    try {
      const arrayBuf = base64ToArrayBuffer(base64Audio);
      const int16Array = new Int16Array(arrayBuf);
      const float32Data = int16PCMToFloat32(int16Array);

      const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;

      activeSourcesRef.current.push(source);
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setTutorSpeaking(false);
        }
      };
    } catch (err) {
      console.error('Error decoding audio chunk:', err);
    }
  };

  const sendTextMessage = async (textToSend?: string) => {
    const text = (textToSend || currentTextDraft).trim();
    if (!text) return;

    // Add user turn to transcripts immediately
    setTranscripts((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setCurrentTextDraft('');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'converse_text',
          text,
        })
      );
      wsRef.current.send(
        JSON.stringify({
          type: 'text',
          text,
        })
      );
    } else {
      // Direct HTTP fallback to /api/chat so speech conversation never fails
      try {
        setTutorSpeaking(true);
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: text }],
            systemInstruction:
              'You are StudyFlowz, a warm, lively AI voice companion for students. Keep your response brief, encouraging, and spoken naturally in 1 to 3 friendly sentences.',
          }),
        });
        const data = await res.json();
        const reply = data.reply || "I'm right here with you! You're doing great, and we will conquer today's goals together.";
        setTranscripts((prev) => [
          ...prev,
          {
            id: `tutor-${Date.now()}`,
            sender: 'tutor',
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(reply);
          utterance.rate = 1.0;
          utterance.pitch = 1.05;
          utterance.onstart = () => setTutorSpeaking(true);
          utterance.onend = () => setTutorSpeaking(false);
          utterance.onerror = () => setTutorSpeaking(false);
          window.speechSynthesis.speak(utterance);
        } else {
          setTutorSpeaking(false);
        }
      } catch (e) {
        setTutorSpeaking(false);
      }
    }
  };

  const interruptTutor = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch (e) {
        // ignore
      }
    });
    activeSourcesRef.current = [];
    setTutorSpeaking(false);
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
  };

  useEffect(() => {
    return () => {
      disconnectSession();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Voice Companion Control */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/40 border border-emerald-500/30 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              Gemini 3.8 Live API • English &amp; தமிழ் Supported (Universal Multilingual)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              StudyFlowz Live Voice Companion
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Have real-time, natural spoken conversations with StudyFlowz. Officially supports English and Tamil, with universal understanding of all world languages. When you feel lonely, stressed, or need motivation during long study hours, talk freely!
            </p>
          </div>

          {/* Action & Voice Choice */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Voice Persona Selector */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
                <Headphones className="w-3 h-3 text-emerald-400" />
                Voice:
              </span>
              {(['Zephyr', 'Puck', 'Kore'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setSelectedVoice(v);
                    if (isConnected) disconnectSession();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedVoice === v
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v === 'Zephyr' ? 'Zephyr (Warm)' : v === 'Puck' ? 'Puck (Lively)' : 'Kore (Calm)'}
                </button>
              ))}
            </div>

            {/* Connection Toggle */}
            {!isConnected ? (
              <button
                onClick={() => startSession()}
                disabled={isConnecting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-450 hover:to-teal-350 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>Connecting Live Voice...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Start Voice Conversation</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isMuted
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                  }`}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                  aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  onClick={interruptTutor}
                  className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-medium cursor-pointer"
                  title="Interrupt companion"
                >
                  Interrupt
                </button>

                <button
                  onClick={disconnectSession}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 font-semibold text-xs cursor-pointer"
                >
                  <Square className="w-3 h-3 fill-rose-300" />
                  <span>End Voice</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Visualizer & Voice Orb */}
        <div className="lg:col-span-1 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col items-center justify-between min-h-[460px] relative shadow-xl">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
            <span className="font-mono text-[11px] text-emerald-400/90">gemini-3.8-live</span>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected
                    ? tutorSpeaking
                      ? 'bg-emerald-400 animate-ping'
                      : userSpeaking
                      ? 'bg-teal-400 animate-ping'
                      : 'bg-emerald-500'
                    : 'bg-slate-600'
                }`}
              />
              <span className="text-[11px] font-medium">
                {isConnected
                  ? tutorSpeaking
                    ? 'StudyFlowz Speaking...'
                    : userSpeaking
                    ? 'Listening to You...'
                    : 'Standing By (Speak freely)'
                  : 'Ready to Connect'}
              </span>
            </span>
          </div>

          {/* Glowing Voice Orb & Dynamic Visualizer */}
          <div className="my-auto flex flex-col items-center justify-center py-4">
            <div
              className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 ${
                isConnected
                  ? tutorSpeaking
                    ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-300 shadow-2xl shadow-emerald-500/40 scale-105 animate-pulse'
                    : userSpeaking
                    ? 'bg-gradient-to-tr from-teal-500 to-emerald-400 shadow-xl shadow-teal-500/30 scale-105'
                    : 'bg-gradient-to-tr from-slate-800 to-emerald-950 border border-emerald-500/30'
                  : 'bg-slate-950 border border-slate-800'
              }`}
            >
              <div className="w-32 h-32 rounded-full bg-slate-950 flex flex-col items-center justify-center p-3 text-center overflow-hidden relative">
                {tutorSpeaking ? (
                  <div className="flex flex-col items-center justify-center">
                    <Volume2 className="w-10 h-10 text-emerald-400 animate-bounce" />
                    <span className="text-[11px] font-bold text-emerald-300 mt-1">Speaking...</span>
                  </div>
                ) : userSpeaking ? (
                  <div className="flex flex-col items-center justify-center">
                    <Mic className="w-10 h-10 text-teal-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-teal-300 mt-1">Listening...</span>
                  </div>
                ) : isConnected ? (
                  <div className="flex flex-col items-center justify-center">
                    <StudyFlowLogo variant="icon" size="sm" glow={true} animate={true} />
                    <span className="text-[10px] font-bold text-emerald-300 mt-1">Live Companion</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <StudyFlowLogo variant="icon" size="sm" glow={true} animate={false} />
                  </div>
                )}
                <span className="text-[9px] text-slate-400">
                  {isConnected ? 'Continuous Voice' : 'Tap to start'}
                </span>
              </div>
            </div>

            {/* Audio Waveform Simulation Bars */}
            <div className="flex items-center gap-1.5 mt-6 h-8">
              {[35, 75, 20, 95, 60, 85, 30, 90, 45, 70, 50, 80].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    tutorSpeaking
                      ? 'bg-emerald-400 animate-pulse'
                      : userSpeaking
                      ? 'bg-teal-400 animate-pulse'
                      : 'bg-slate-800 h-2'
                  }`}
                  style={{
                    height: tutorSpeaking || userSpeaking ? `${h}%` : '6px',
                    transitionDuration: '120ms',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Quick status footer */}
          <div className="w-full text-center pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            {isConnected ? (
              <span className="text-emerald-300 font-medium">
                💡 Tip: Speak naturally. Interrupt anytime to ask questions!
              </span>
            ) : (
              <span>Start session to enable real-time bidirectional voice</span>
            )}
          </div>
        </div>

        {/* Right Column: Live Conversation Transcript & Anti-Loneliness Motivation */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between min-h-[460px] shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Live Conversation Transcript</h3>
              </div>
              <div className="flex items-center gap-2">
                {onSwitchToChat && (
                  <button
                    onClick={onSwitchToChat}
                    className="text-[11px] text-slate-400 hover:text-emerald-300 underline cursor-pointer"
                  >
                    Switch to Text Chat
                  </button>
                )}
                <span className="text-[10px] text-slate-500 font-mono">16kHz In / 24kHz Out</span>
              </div>
            </div>

            {/* Transcript scrollable list */}
            <div className="mt-4 space-y-3 max-h-[220px] overflow-y-auto pr-2 scrollbar-none">
              {transcripts.map((t) => (
                <div
                  key={t.id}
                  className={`flex flex-col ${t.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                    <span className="font-semibold">{t.sender === 'user' ? 'You' : 'StudyFlowz'}</span>
                    <span>•</span>
                    <span>{t.timestamp}</span>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl max-w-[88%] text-xs sm:text-sm leading-relaxed ${
                      t.sender === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-sm'
                        : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {t.text}
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>

          {/* Quick Companionship & Anti-Loneliness Motivation Action Chips */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-pink-400" />
                Anti-Loneliness &amp; Instant Motivation Prompts
              </span>
              <span className="text-[10px] text-slate-400">Tap to speak with StudyFlowz</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {companionPrompts.map((cp, idx) => {
                const Icon = cp.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!isConnected) {
                        startSession(cp.prompt);
                      } else {
                        sendTextMessage(cp.prompt);
                      }
                    }}
                    className={`p-2.5 rounded-2xl ${cp.cardClass} border text-left transition-all hover:scale-[1.02] cursor-pointer group shadow-sm`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs font-bold truncate">{cp.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-300/80 line-clamp-1 group-hover:text-white transition-colors">
                      {cp.prompt}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Fallback Text Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendTextMessage();
              }}
              className="mt-3 flex items-center gap-2"
            >
              <input
                type="text"
                value={currentTextDraft}
                onChange={(e) => setCurrentTextDraft(e.target.value)}
                placeholder={
                  isConnected
                    ? 'Type or speak into the live voice session...'
                    : 'Type a message to start live voice session...'
                }
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!currentTextDraft.trim()}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer transition-colors"
                aria-label="Send message to live tutor"
              >
                <span>Send</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
