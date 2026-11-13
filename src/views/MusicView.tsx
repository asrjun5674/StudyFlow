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
  Search,
  Star,
  Plus,
  Headphones,
  Radio,
  Heart,
  Check,
  Disc,
} from 'lucide-react';

interface CuratedSong {
  id: string;
  title: string;
  artist: string;
  category: 'lofi' | 'classical' | 'cinematic' | 'acoustic' | 'ambient';
  spotifyUri: string; // embed URL or standard spotify track/playlist url
  spotifyUrl: string;
  duration: string;
}

interface AmbientTrack {
  id: string;
  name: string;
  category: 'nature' | 'relax' | 'instrumental';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  baseFreq: number;
}

const DEFAULT_CURATED_SONGS: CuratedSong[] = [
  {
    id: 'lofi-1',
    title: 'Lofi Girl - Beats to relax/study to',
    artist: 'Lofi Girl Records',
    category: 'lofi',
    spotifyUri: 'https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM',
    spotifyUrl: 'https://open.spotify.com/playlist/0vvXsWCC9xrXsKd4FyS8kM',
    duration: 'Live / 24/7',
  },
  {
    id: 'interstellar',
    title: 'Cornfield Chase / Main Theme',
    artist: 'Hans Zimmer (Interstellar)',
    category: 'cinematic',
    spotifyUri: 'https://open.spotify.com/embed/track/6pWgRkpqVfxnj3WuUNMu77',
    spotifyUrl: 'https://open.spotify.com/track/6pWgRkpqVfxnj3WuUNMu77',
    duration: '2:07',
  },
  {
    id: 'experience',
    title: 'Experience',
    artist: 'Ludovico Einaudi',
    category: 'classical',
    spotifyUri: 'https://open.spotify.com/embed/track/1BncfTToMfytOkOwVVvmLJ',
    spotifyUrl: 'https://open.spotify.com/track/1BncfTToMfytOkOwVVvmLJ',
    duration: '5:15',
  },
  {
    id: 'river-flows',
    title: 'River Flows in You',
    artist: 'Yiruma',
    category: 'classical',
    spotifyUri: 'https://open.spotify.com/embed/track/64rL4R0rJr59VgqP4U2t06',
    spotifyUrl: 'https://open.spotify.com/track/64rL4R0rJr59VgqP4U2t06',
    duration: '3:08',
  },
  {
    id: 'clair-de-lune',
    title: 'Clair de Lune, L. 32',
    artist: 'Claude Debussy',
    category: 'classical',
    spotifyUri: 'https://open.spotify.com/embed/track/6N7gEj5X9NBwz4mC9A98iH',
    spotifyUrl: 'https://open.spotify.com/track/6N7gEj5X9NBwz4mC9A98iH',
    duration: '5:04',
  },
  {
    id: 'deep-focus',
    title: 'Deep Focus - Ambient Study',
    artist: 'Spotify Curated',
    category: 'ambient',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ',
    duration: '8h+ Focus',
  },
  {
    id: 'resonance',
    title: 'Resonance',
    artist: 'HOME',
    category: 'ambient',
    spotifyUri: 'https://open.spotify.com/embed/track/1Tu2b17y57kYc2F1r3G6oM',
    spotifyUrl: 'https://open.spotify.com/track/1Tu2b17y57kYc2F1r3G6oM',
    duration: '3:32',
  },
  {
    id: 'ghibli-theme',
    title: 'Merry-Go-Round of Life',
    artist: 'Joe Hisaishi (Studio Ghibli)',
    category: 'cinematic',
    spotifyUri: 'https://open.spotify.com/embed/track/1Y8WdZqKj32b9A8lE3xQ6o',
    spotifyUrl: 'https://open.spotify.com/track/1Y8WdZqKj32b9A8lE3xQ6o',
    duration: '5:10',
  },
  {
    id: 'yellow-acoustic',
    title: 'Yellow (Acoustic Version)',
    artist: 'Coldplay',
    category: 'acoustic',
    spotifyUri: 'https://open.spotify.com/embed/track/3AJwUDP919kvQ9QcozQPxg',
    spotifyUrl: 'https://open.spotify.com/track/3AJwUDP919kvQ9QcozQPxg',
    duration: '4:29',
  },
  {
    id: 'golden-hour',
    title: 'Golden Hour (Piano & Cello)',
    artist: 'JVKE',
    category: 'acoustic',
    spotifyUri: 'https://open.spotify.com/embed/track/5odlY52u43F5BjByhxg7wg',
    spotifyUrl: 'https://open.spotify.com/track/5odlY52u43F5BjByhxg7wg',
    duration: '3:29',
  },
  {
    id: 'nuvole-bianche',
    title: 'Nuvole Bianche',
    artist: 'Ludovico Einaudi',
    category: 'classical',
    spotifyUri: 'https://open.spotify.com/embed/track/3weNRklVDqq4J3Gslsv3CV',
    spotifyUrl: 'https://open.spotify.com/track/3weNRklVDqq4J3Gslsv3CV',
    duration: '5:57',
  },
  {
    id: 'gymnopedie',
    title: 'Gymnopédie No. 1',
    artist: 'Erik Satie',
    category: 'classical',
    spotifyUri: 'https://open.spotify.com/embed/track/5NGtFXVpXSvwunEIGviY3v',
    spotifyUrl: 'https://open.spotify.com/track/5NGtFXVpXSvwunEIGviY3v',
    duration: '3:12',
  },
  {
    id: 'binaural-study',
    title: 'Binaural Alpha Waves 432Hz',
    artist: 'Mind & Memory Focus',
    category: 'ambient',
    spotifyUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
    duration: 'Focus Waves',
  },
  {
    id: 'anirudh-acoustic',
    title: 'Master the Blaster (Instrumental)',
    artist: 'Anirudh Ravichander',
    category: 'acoustic',
    spotifyUri: 'https://open.spotify.com/embed/track/3yGk2m4O57Q8m7Y5k3Q1aA',
    spotifyUrl: 'https://open.spotify.com/track/3yGk2m4O57Q8m7Y5k3Q1aA',
    duration: '3:40',
  },
];

export const MusicView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'spotify' | 'ambient'>('spotify');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favoriteSongIds, setFavoriteSongIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('studyflow_favorite_songs');
        return saved ? JSON.parse(saved) : ['lofi-1', 'interstellar', 'experience'];
      } catch (e) {
        return ['lofi-1', 'interstellar'];
      }
    }
    return ['lofi-1', 'interstellar'];
  });

  const [customSongs, setCustomSongs] = useState<CuratedSong[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('studyflow_custom_songs');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Current playing/loaded Spotify track
  const [activeTrack, setActiveTrack] = useState<CuratedSong>(DEFAULT_CURATED_SONGS[0]);

  // Custom Spotify Link Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newUrlOrId, setNewUrlOrId] = useState('');

  // Ambient Sounds state
  const [playingAmbientId, setPlayingAmbientId] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.4);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
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

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteSongIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('studyflow_favorite_songs', JSON.stringify(updated));
      } catch (err) {
        // ignore
      }
      return updated;
    });
  };

  const handleAddCustomSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Convert link to embed link
    let embedUrl = newUrlOrId.trim();
    let directUrl = newUrlOrId.trim();

    if (embedUrl.includes('open.spotify.com/')) {
      if (!embedUrl.includes('/embed/')) {
        embedUrl = embedUrl.replace('open.spotify.com/', 'open.spotify.com/embed/');
      }
    } else if (embedUrl.startsWith('spotify:')) {
      const parts = embedUrl.split(':');
      if (parts.length >= 3) {
        embedUrl = `https://open.spotify.com/embed/${parts[1]}/${parts[2]}`;
        directUrl = `https://open.spotify.com/${parts[1]}/${parts[2]}`;
      }
    } else if (!embedUrl.startsWith('http')) {
      // Treat as search query embed
      embedUrl = `https://open.spotify.com/embed/search/${encodeURIComponent(embedUrl)}`;
      directUrl = `https://open.spotify.com/search/${encodeURIComponent(newTitle + ' ' + newArtist)}`;
    }

    const newSong: CuratedSong = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Custom Track',
      category: 'lofi',
      spotifyUri: embedUrl,
      spotifyUrl: directUrl || 'https://open.spotify.com',
      duration: 'Spotify',
    };

    const updated = [newSong, ...customSongs];
    setCustomSongs(updated);
    try {
      localStorage.setItem('studyflow_custom_songs', JSON.stringify(updated));
    } catch (err) {
      // ignore
    }

    // Auto favorite it
    toggleFavorite(newSong.id);
    setActiveTrack(newSong);

    setNewTitle('');
    setNewArtist('');
    setNewUrlOrId('');
    setShowAddModal(false);
  };

  // Convert search query to direct spotify embed if not found in catalog
  const handleDirectSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 2) {
      const directSearchSong: CuratedSong = {
        id: `search-${Date.now()}`,
        title: query.trim(),
        artist: 'Spotify Search Match',
        category: 'lofi',
        spotifyUri: `https://open.spotify.com/embed/search/${encodeURIComponent(query.trim())}`,
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(query.trim())}`,
        duration: 'Online Search',
      };
      setActiveTrack(directSearchSong);
    }
  };

  const allSongs = [...customSongs, ...DEFAULT_CURATED_SONGS];

  const filteredSongs = allSongs.filter((song) => {
    if (selectedCategory === 'favorites') {
      if (!favoriteSongIds.includes(song.id)) return false;
    } else if (selectedCategory !== 'all') {
      if (song.category !== selectedCategory) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = song.title.toLowerCase().includes(q);
      const matchArtist = song.artist.toLowerCase().includes(q);
      return matchTitle || matchArtist;
    }

    return true;
  });

  // Stop ambient audio
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
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // White/pink noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(track.baseFreq, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(masterGain);

      whiteNoise.start();
      activeSourcesRef.current.push(whiteNoise);
      setPlayingAmbientId(track.id);
    } catch (e) {
      console.warn('Could not start ambient sound:', e);
    }
  };

  useEffect(() => {
    return () => {
      stopAmbient();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-sky-500/10 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 border border-emerald-500/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-500/30">
            <Music className="w-3.5 h-3.5 text-emerald-500" />
            Spotify Focus Hub &amp; Ambience
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Study Music &amp; Spotify Search
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
            Search your favorite Spotify songs, artists, or lofi playlists, or relax with synthesized nature soundscapes.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('spotify')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'spotify'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Spotify Player &amp; Search</span>
          </button>
          <button
            onClick={() => setActiveTab('ambient')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ambient'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Nature Soundscapes</span>
          </button>
        </div>
      </div>

      {/* SPOTIFY TAB */}
      {activeTab === 'spotify' && (
        <div className="space-y-6">
          {/* Active Player Card with Spotify Iframe */}
          <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-lg shadow-emerald-500/5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                  <Disc className="w-6 h-6 animate-spin-slow" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      Now Loaded in Spotify Player
                    </span>
                    <button
                      onClick={() => toggleFavorite(activeTrack.id)}
                      className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      title={favoriteSongIds.includes(activeTrack.id) ? 'Remove favorite' : 'Add to favorites'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          favoriteSongIds.includes(activeTrack.id) ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate mt-0.5">
                    {activeTrack.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeTrack.artist} • {activeTrack.duration}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <a
                  href={activeTrack.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <span>Open in Spotify App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Song / Link</span>
                </button>
              </div>
            </div>

            {/* Embedded Spotify Iframe */}
            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md">
              <iframe
                src={activeTrack.spotifyUri}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title={`Spotify Player - ${activeTrack.title}`}
                className="w-full"
              />
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleDirectSearch(searchQuery);
                    }
                  }}
                  placeholder="Search any song, artist (e.g. Taylor Swift, Interstellar, Anirudh, Chopin)..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-24 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                />
                {searchQuery.trim().length > 0 && (
                  <button
                    onClick={() => handleDirectSearch(searchQuery)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] cursor-pointer"
                  >
                    Search Spotify
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Songs' },
                  { id: 'favorites', label: `★ Favorites (${favoriteSongIds.length})` },
                  { id: 'lofi', label: 'Lo-Fi' },
                  { id: 'classical', label: 'Classical' },
                  { id: 'cinematic', label: 'Cinematic' },
                  { id: 'acoustic', label: 'Acoustic' },
                  { id: 'ambient', label: 'Ambient' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === tab.id
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Curated Track Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredSongs.map((song) => {
              const isLoaded = activeTrack.id === song.id;
              const isFav = favoriteSongIds.includes(song.id);
              return (
                <div
                  key={song.id}
                  onClick={() => setActiveTrack(song)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-sm group ${
                    isLoaded
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isLoaded
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-emerald-500/20 group-hover:text-emerald-500'
                      }`}
                      aria-label="Play track"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                    <div className="min-w-0">
                      <h4
                        className={`text-xs font-bold truncate transition-colors ${
                          isLoaded
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300'
                        }`}
                      >
                        {song.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {song.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                      {song.duration}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(song.id, e)}
                      className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                      title={isFav ? 'Remove favorite' : 'Add to favorites'}
                    >
                      <Star
                        className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSongs.length === 0 && (
            <div className="py-12 text-center rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-8 space-y-3">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No songs match &quot;{searchQuery}&quot; in the local study library.
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click &quot;Search Spotify Directly&quot; to search the entire global Spotify database for &quot;{searchQuery}&quot;!
              </p>
              <button
                onClick={() => handleDirectSearch(searchQuery)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
              >
                Search Spotify for &quot;{searchQuery}&quot;
              </button>
            </div>
          )}
        </div>
      )}

      {/* AMBIENT SOUNDS TAB */}
      {activeTab === 'ambient' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  playingAmbientId
                    ? 'bg-gradient-to-tr from-sky-500 to-teal-400 text-slate-950 shadow-lg shadow-sky-500/25 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {playingAmbientId
                    ? ambientTracks.find((t) => t.id === playingAmbientId)?.name
                    : 'No soundscape playing'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {playingAmbientId
                    ? 'Synthesized real-time via Web Audio API'
                    : 'Select a soundscape below to begin instant playback'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVolume(volume > 0 ? 0 : 0.4)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  aria-label="Toggle mute"
                >
                  {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
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

              {playingAmbientId && (
                <button
                  onClick={stopAmbient}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/25 cursor-pointer"
                >
                  Stop Sound
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ambientTracks.map((track) => {
              const Icon = track.icon;
              const isPlaying = playingAmbientId === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => (isPlaying ? stopAmbient() : playAmbient(track))}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group shadow-sm ${
                    isPlaying
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 shadow-md shadow-sky-500/10'
                      : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isPlaying
                          ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-sky-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <button
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                      }`}
                      aria-label={isPlaying ? 'Pause sound' : 'Play sound'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                    {track.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {track.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Custom Song / Spotify Link Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Favorite Song or Spotify Link
            </h3>

            <form onSubmit={handleAddCustomSong} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Song Title:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. As It Was"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Artist Name:
                </label>
                <input
                  type="text"
                  value={newArtist}
                  onChange={(e) => setNewArtist(e.target.value)}
                  placeholder="e.g. Harry Styles"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Spotify Link, Track URI, or Search Term:
                </label>
                <input
                  type="text"
                  value={newUrlOrId}
                  onChange={(e) => setNewUrlOrId(e.target.value)}
                  placeholder="Paste open.spotify.com/track/... or song name"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  You can paste any Spotify share link, or just type a search query.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Save &amp; Play
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
