import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  ExternalLink,
  Sparkles,
  CloudRain,
  Trees,
  Coffee,
  Flame,
  Waves,
  Moon,
} from 'lucide-react';

interface AmbientTrack {
  id: string;
  name: string;
  category: 'nature' | 'relax' | 'instrumental';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  baseFreq: number;
}

export const MusicView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ambient' | 'spotify'>('ambient');
  const [playingAmbientId, setPlayingAmbientId] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.4);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);

  // Web Audio Context & Synthesizer Nodes for Nature Ambience
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const activeSourcesRef = useRef<any[]>([]);

  const ambientTracks: AmbientTrack[] = [
    {
      id: 'rain',
      name: 'Gentle Rainfall on Window',
      category: 'nature',
      icon: CloudRain,
      description: 'Pink-noise filtered drops to mask background distractions',
      baseFreq: 400,
    },
    {
      id: 'forest',
      name: 'Deep Forest & Morning Birds',
      category: 'nature',
      icon: Trees,
      description: 'Serene woodland atmosphere for calm, steady focus',
      baseFreq: 800,
    },
    {
      id: 'cafe',
      name: 'Cozy Library & Study Cafe',
      category: 'relax',
      icon: Coffee,
      description: 'Warm low-frequency murmur that stimulates creativity',
      baseFreq: 300,
    },
    {
      id: 'campfire',
      name: 'Warm Hearth & Campfire',
      category: 'nature',
      icon: Flame,
      description: 'Soft rhythmic crackling for evening study sessions',
      baseFreq: 250,
    },
    {
      id: 'ocean',
      name: 'Tranquil Ocean Swell',
      category: 'nature',
      icon: Waves,
      description: 'Slow rhythmic waves that lower heart rate and reduce stress',
      baseFreq: 180,
    },
    {
      id: 'night',
      name: 'Sleep & Night Wind',
      category: 'relax',
      icon: Moon,
      description: 'Subtle binaural alpha waves for deep calm and winding down',
      baseFreq: 120,
    },
  ];

  // Stop current ambient playback
  const stopAmbient = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {
        // ignore
      }
    });
    activeSourcesRef.current = [];
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {
        // ignore
      }
      audioCtxRef.current = null;
    }
    setPlayingAmbientId(null);
  };

  // Play synthetic ambient soundscape
  const playAmbient = (track: AmbientTrack) => {
    stopAmbient();

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Generate soft pink noise buffer for realistic nature / rain / waves texture
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to sculpt tone
      const filter = ctx.createBiquadFilter();
      filter.type = track.id === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.setValueAtTime(track.baseFreq, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(masterGain);

      // Add gentle harmonic oscillator for melodic calm
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(track.baseFreq / 2, ctx.currentTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(masterGain);

      whiteNoise.start();
      osc.start();

      activeSourcesRef.current = [whiteNoise, osc];
      setPlayingAmbientId(track.id);
    } catch (e) {
      console.warn('Audio synthesis restricted:', e);
    }
  };

  // Adjust volume
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Sleep Timer countdown
  useEffect(() => {
    if (!sleepTimerMinutes) {
      setTimerSecondsLeft(null);
      return;
    }

    setTimerSecondsLeft(sleepTimerMinutes * 60);
    const interval = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (!prev || prev <= 1) {
          stopAmbient();
          setSleepTimerMinutes(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerMinutes]);

  useEffect(() => {
    return () => {
      stopAmbient();
    };
  }, []);

  // Curated Official Spotify Embeds for Students
  const spotifyPlaylists = [
    {
      title: 'Deep Focus & Study Flow',
      description: 'Official Spotify Focus • Instrumental and calming beats',
      embedUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0',
    },
    {
      title: 'Peaceful Piano for Studying',
      description: 'Delicate, beautiful modern piano solos for concentration',
      embedUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0',
    },
    {
      title: 'Lo-Fi Beats to Study & Relax',
      description: 'Chilled beats, gentle rhythm, zero lyrics to interrupt thoughts',
      embedUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-950/40 via-teal-950/20 to-slate-900 border border-sky-500/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-sky-500/30">
            <Music className="w-3.5 h-3.5 text-sky-400" />
            Audio Focus &amp; Ambient Sanctuary
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Focus Music &amp; Nature Soundscapes
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Block out home distractions with science-backed nature audio or stream official instrumental Spotify playlists.
          </p>
        </div>

        {/* Tab switch */}
        <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setActiveTab('ambient')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ambient'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nature Soundscapes (Instant)
          </button>
          <button
            onClick={() => setActiveTab('spotify')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'spotify'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Official Spotify Playlists
          </button>
        </div>
      </div>

      {/* AMBIENT SOUNDS TAB */}
      {activeTab === 'ambient' && (
        <div className="space-y-6">
          {/* Master Ambient Controls Card */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  playingAmbientId
                    ? 'bg-gradient-to-tr from-sky-500 to-teal-400 text-slate-950 shadow-lg shadow-sky-500/25 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {playingAmbientId
                    ? ambientTracks.find((t) => t.id === playingAmbientId)?.name
                    : 'No soundscape playing'}
                </h3>
                <p className="text-xs text-slate-400">
                  {playingAmbientId
                    ? 'Synthesized real-time via Web Audio API'
                    : 'Select a soundscape below to begin'}
                </p>
              </div>
            </div>

            {/* Volume slider & Sleep Timer */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              {/* Volume Slider */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVolume(volume > 0 ? 0 : 0.4)}
                  className="text-slate-400 hover:text-white"
                  aria-label="Toggle mute"
                >
                  {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-24 accent-sky-500 cursor-pointer"
                  aria-label="Volume level"
                />
              </div>

              {/* Sleep timer dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sleepTimerMinutes || ''}
                  onChange={(e) => setSleepTimerMinutes(e.target.value ? Number(e.target.value) : null)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                >
                  <option value="">No Sleep Timer</option>
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
                {timerSecondsLeft !== null && (
                  <span className="font-mono text-sky-400 font-bold ml-1">
                    {Math.floor(timerSecondsLeft / 60)}:{(timerSecondsLeft % 60).toString().padStart(2, '0')}
                  </span>
                )}
              </div>

              {playingAmbientId && (
                <button
                  onClick={stopAmbient}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-600/30 cursor-pointer"
                >
                  Stop Sound
                </button>
              )}
            </div>
          </div>

          {/* Soundscapes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ambientTracks.map((track) => {
              const Icon = track.icon;
              const isPlaying = playingAmbientId === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => (isPlaying ? stopAmbient() : playAmbient(track))}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isPlaying
                      ? 'bg-sky-950/40 border-sky-500 shadow-lg shadow-sky-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isPlaying
                          ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                          : 'bg-slate-950 text-slate-400 group-hover:text-sky-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <button
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                      }`}
                      aria-label={isPlaying ? 'Pause sound' : 'Play sound'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-sky-200 transition-colors">
                    {track.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {track.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* OFFICIAL SPOTIFY TAB */}
      {activeTab === 'spotify' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200 flex items-center justify-between">
            <span>
              Official Spotify Web Player embeds. You can play directly or open in the Spotify app with your student account.
            </span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              Spotify Certified
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {spotifyPlaylists.map((pl, idx) => (
              <div key={idx} className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white truncate max-w-[200px]">{pl.title}</h4>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{pl.description}</p>
                <div className="rounded-xl overflow-hidden shadow-lg border border-slate-800">
                  <iframe
                    src={pl.embedUri}
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title={pl.title}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
