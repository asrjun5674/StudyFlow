import React, { useState } from 'react';
import {
  Settings,
  User,
  Palette,
  ShieldCheck,
  Download,
  Upload,
  RotateCcw,
  Check,
  Sparkles,
  Crown,
  LogIn,
  LogOut,
  MailCheck,
  AlertCircle,
} from 'lucide-react';
import { NavigationSection, PlanTier, StudentProfile, ThemeType, WallpaperType } from '../types';
import { useTheme, THEME_CONFIGS } from '../utils/themeContext';
import { StorageManager } from '../utils/storage';
import { StudyFlowLogo } from '../components/StudyFlowLogo';
import { PRO_PLANS } from '../utils/proAndPlugins';

interface SettingsViewProps {
  profile: StudentProfile;
  planTier: PlanTier;
  authInfo: {
    isSignedIn: boolean;
    displayName: string | null;
    email: string | null;
    emailVerified: boolean;
    provider: 'google' | 'password' | 'guest';
  };
  onOpenAuth: () => void;
  onSignOut: () => void;
  onResendVerification: () => Promise<void>;
  onNavigate: (section: NavigationSection) => void;
  onUpdateProfile: (p: StudentProfile) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  planTier,
  authInfo,
  onOpenAuth,
  onSignOut,
  onResendVerification,
  onNavigate,
  onUpdateProfile,
  onResetData,
}) => {
  const { theme, setTheme, wallpaper, setWallpaper } = useTheme();

  const [name, setName] = useState(profile.name);
  const [grade, setGrade] = useState(profile.grade);
  const [school, setSchool] = useState(profile.school);
  const [dailyGoal, setDailyGoal] = useState(profile.dailyGoalMinutes);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Guardian controls
  const [academicFilterOnly, setAcademicFilterOnly] = useState(true);
  const [chatHistorySaved, setChatHistorySaved] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name,
      grade,
      school,
      dailyGoalMinutes: dailyGoal,
      avatar,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = () => {
    const jsonStr = StorageManager.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageManager.importData(content);
      if (success) {
        setImportMessage('Data successfully imported! Refreshing view...');
        setTimeout(() => window.location.reload(), 900);
      } else {
        setImportMessage('Invalid backup file. Please ensure it is a valid StudyFlow JSON export.');
      }
    };
    reader.readAsText(file);
  };

  const wallpapers: Array<{ id: WallpaperType; label: string; desc: string }> = [
    { id: 'meadow', label: 'Ghibli Meadow', desc: 'Soft pastel greens and gentle nature vibes' },
    { id: 'clean', label: 'Minimal Studio', desc: 'Clean, distraction-free neutral gradient' },
    { id: 'clouds', label: 'Pastel Clouds', desc: 'Airy daylight sky with fluffy cloud accents' },
    { id: 'starry', label: 'Starry Midnight', desc: 'Quiet twilight sky for night owls' },
    { id: 'cottage', label: 'Cozy Cottage', desc: 'Warm study window warmth and comfort' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-500/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-500/30">
            <Settings className="w-3.5 h-3.5 text-emerald-400" />
            Preferences &amp; Safety
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Settings &amp; Personalisation
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Manage your Gmail / Username account, Pro UPI plan, themes, wallpapers, and guardian safety privacy filters.
          </p>
        </div>
      </div>

      {/* 0. Account, Authentication & Pro Plan Status */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Account, Cloud Sync &amp; Pro Plan</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1">
              <Crown className="w-3 h-3" />
              {PRO_PLANS.find((p) => p.id === planTier)?.name || 'Starter Student'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Sign-In Status</div>
            {authInfo.isSignedIn ? (
              <>
                <div className="text-sm font-bold text-white">
                  {authInfo.displayName || profile.name}
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-mono">
                    {authInfo.provider === 'google' ? 'Gmail / Google' : 'Username & Password'}
                  </span>
                </div>
                {authInfo.email && !authInfo.email.endsWith('@users.studyflow.app') && (
                  <div className="text-slate-400 font-mono text-[11px]">{authInfo.email}</div>
                )}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  {authInfo.emailVerified ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                      <MailCheck className="w-3.5 h-3.5" /> Verified • Firebase Cloud Sync Active
                    </span>
                  ) : authInfo.provider === 'password' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                      <MailCheck className="w-3.5 h-3.5" /> Account Active • Signed in with Username &amp; Password
                    </span>
                  ) : (
                    <div className="space-y-1.5 w-full">
                      <span className="inline-flex items-center gap-1 text-amber-300 text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5" /> Saving locally. Verify email or connect Gmail for Cloud Sync.
                      </span>
                      {authInfo.email && !authInfo.email.endsWith('@users.studyflow.app') && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await onResendVerification();
                              setVerifyMsg('Verification email sent! Check your inbox.');
                            } catch (e: any) {
                              setVerifyMsg(e?.message || 'Could not send verification email.');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-[11px] font-semibold cursor-pointer"
                        >
                          Resend Verification Email
                        </button>
                      )}
                      {verifyMsg && <div className="text-[11px] text-emerald-300">{verifyMsg}</div>}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-bold text-slate-200">Guest Mode (Local Storage)</div>
                <p className="text-[11px] text-slate-400">
                  Sign in with Gmail or Username &amp; Password to sync progress and send Parent Reports via Gmail.
                </p>
              </>
            )}

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{authInfo.isSignedIn ? 'Switch Account / Link Gmail' : 'Sign In (Gmail / Password)'}</span>
              </button>
              {authInfo.isSignedIn && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Pro Upgrade &amp; Parent Plugins</div>
              <div className="text-sm font-bold text-white mt-1">
                {PRO_PLANS.find((p) => p.id === planTier)?.name || 'StudyFlow Pro Ultra'}
                {planTier === 'pro_ultra' ? ' (Unlocked Free!)' : ''}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                StudyFlow Pro Ultra is unlocked free right now — Gemini 4 Argon Deep Thinking AI and WhatsApp + Gmail Parent Progress Plugins are active.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('pro')}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>Manage Pro Plans &amp; Plugins</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Theme & Wallpaper Selector */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Visual Themes (7 Whimsical Aesthetics)</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Instant Apply</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(THEME_CONFIGS).map(([key, cfg]) => {
            const isSelected = theme === key;
            return (
              <button
                key={key}
                onClick={() => setTheme(key as any)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-400 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: cfg.primaryColor }}
                  />
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <h4 className="text-xs font-bold text-white">{cfg.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{cfg.description}</p>
              </button>
            );
          })}
        </div>

        {/* Wallpaper Picker */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-300 block mb-2">
            Background Atmosphere Style:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {wallpapers.map((wp) => (
              <button
                key={wp.id}
                onClick={() => setWallpaper(wp.id)}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  wallpaper === wp.id
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">{wp.label}</div>
                <div className="text-[10px] text-slate-500 line-clamp-1">{wp.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Student Profile */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Student Profile</h3>
          </div>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-mono">
              <Check className="w-3.5 h-3.5" /> Saved Successfully!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Class / Grade:
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                School Name:
              </label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Daily Focus Goal (Minutes):
              </label>
              <input
                type="number"
                min="15"
                max="360"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Avatar Emoji:
              </label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* 3. Guardian & Privacy Controls */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Guardian Safety &amp; Privacy Controls</h3>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
            <div>
              <span className="font-bold text-white block">Strict Academic AI Filter</span>
              <span className="text-[11px] text-slate-400">
                Restricts StudyFlowz AI strictly to school curricula, homework problem solving, and encouraging tutoring.
              </span>
            </div>
            <input
              type="checkbox"
              checked={academicFilterOnly}
              onChange={(e) => setAcademicFilterOnly(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
            <div>
              <span className="font-bold text-white block">Store Data Locally On Device</span>
              <span className="text-[11px] text-slate-400">
                All study schedules, notes, and alarms stay in your browser storage. Zero tracking or telemetry.
              </span>
            </div>
            <input
              type="checkbox"
              checked={chatHistorySaved}
              onChange={(e) => setChatHistorySaved(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* 4. Official StudyFlow Branding & Logo Showcase */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Brand Assets &amp; Identity
            </div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Official StudyFlow Logos
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              The official StudyFlow visual emblem: An iridescent glass sphere bubble framing an open book of knowledge that transforms into an energetic student reaching for a shining guiding star.
            </p>
          </div>

          <a
            href="/studyflow-logo.png"
            download="StudyFlow_Official_Logo.png"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 hover:from-sky-450 hover:to-pink-450 text-white text-xs font-bold shadow-lg shadow-pink-500/20 cursor-pointer self-start sm:self-center transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res Logo</span>
          </a>
        </div>

        {/* Logo Variations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Hero Full Logo */}
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-6 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-mono text-slate-400 mb-4 uppercase tracking-wider">Full Brand Mark</span>
            <StudyFlowLogo variant="vertical" size="lg" glow={true} animate={true} />
            <span className="text-[10px] text-slate-500 mt-4">3D Glass Orb + Typography</span>
          </div>

          {/* Card 2: Scalable Vector Emblem */}
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-6 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-mono text-slate-400 mb-4 uppercase tracking-wider">Vector SVG Orb</span>
            <StudyFlowLogo variant="vertical" size="lg" useImage={false} glow={true} animate={true} />
            <span className="text-[10px] text-slate-500 mt-4">Crisp Vector Paths</span>
          </div>

          {/* Card 3: Horizontal Header Lockup */}
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Header Lockup</span>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 w-full flex justify-center">
              <StudyFlowLogo variant="horizontal" size="sm" glow={true} animate={false} />
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 w-full flex justify-center">
              <StudyFlowLogo variant="horizontal" size="sm" useImage={false} glow={false} animate={false} />
            </div>
            <span className="text-[10px] text-slate-500">Compact Navigation Lockups</span>
          </div>
        </div>

        {/* Brand Colors Palette */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#38bdf8] shadow-sm shadow-sky-500/40" />
              <span className="font-mono text-slate-300">#38BDF8 (Electric Cyan)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#f472b6] shadow-sm shadow-pink-500/40" />
              <span className="font-mono text-slate-300">#F472B6 (Neon Pink)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#10b981] shadow-sm shadow-emerald-500/40" />
              <span className="font-mono text-slate-300">#10B981 (Mint Green)</span>
            </div>
          </div>
          <span className="text-slate-400 font-medium">Tagline: <strong className="text-white">PLAN | LEARN | GROW</strong></span>
        </div>
      </div>

      {/* 5. Data Export / Import & Reset */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Data Portability &amp; Backup</h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Data as JSON</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer">
            <Upload className="w-4 h-4 text-sky-400" />
            <span>Import Data Backup</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportData}
            />
          </label>

          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 text-xs font-semibold border border-rose-500/30 cursor-pointer ml-auto"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Reset Demo Data</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => {
                  onResetData();
                  setConfirmReset(false);
                }}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {importMessage && (
          <p className="text-xs text-emerald-300 pt-1">{importMessage}</p>
        )}
      </div>

      {/* 5. Copyright & Ownership Information */}
      <div className="rounded-2xl bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm text-xs">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Copyright &amp; Ownership Notice</h3>
        </div>

        <div className="space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            &copy; {new Date().getFullYear()} StudyFlow. All rights reserved.
          </p>
          <p>
            <strong>StudyFlow &bull; PLAN | LEARN | GROW</strong> is an intellectual educational productivity platform designed for students. All branding, UI designs, graphics, and interactive learning components are protected under international copyright and intellectual property laws.
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-500">
            Powered by Google Gemini AI. Spotify is a registered trademark of Spotify AB. All music streams and playlist embeds are routed via official Spotify APIs.
          </p>
        </div>
      </div>
    </div>
  );
};
