import React, { useState } from 'react';
import {
  X,
  Lock,
  User as UserIcon,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { StudyFlowLogo } from './StudyFlowLogo';
import {
  mapAuthErrorMessage,
  signInWithGmail,
  signInWithUsernameOrEmail,
  signUpWithUsernamePassword,
} from '../utils/firebase';
import { StorageManager } from '../utils/storage';
import { LocalAuthUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  canDismiss: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
  onAuthSuccess: (info: {
    method: 'google' | 'password';
    username?: string;
    localUser?: LocalAuthUser;
    hasGmailToken?: boolean;
  }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  canDismiss,
  onClose,
  onContinueAsGuest,
  onAuthSuccess,
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);
    try {
      const { user, hasGmailToken } = await signInWithGmail(false);
      onAuthSuccess({
        method: 'google',
        username: user.displayName || user.email?.split('@')[0] || 'student',
        hasGmailToken,
      });
    } catch (err: any) {
      setErrorMsg(mapAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);
    try {
      if (tab === 'signin') {
        const map = StorageManager.getUsernameMap();
        const res = await signInWithUsernameOrEmail(identifier, password, map);
        setPassword('');
        if (res.mode === 'firebase') {
          onAuthSuccess({
            method: 'password',
            username: res.user.displayName || identifier.trim(),
          });
        } else {
          StorageManager.registerUsernameMapping(res.localUser.username, res.localUser.email);
          onAuthSuccess({
            method: 'password',
            username: res.localUser.displayName || res.localUser.username,
            localUser: res.localUser,
          });
        }
      } else {
        const res = await signUpWithUsernamePassword({
          username,
          email,
          password,
        });
        StorageManager.registerUsernameMapping(res.normalizedUsername, res.resolvedEmail);
        setPassword('');
        if (res.verificationSent) {
          setInfoMsg('Account created! A verification email was sent so you can also enable cloud sync.');
        }
        onAuthSuccess({
          method: 'password',
          username: res.localUser?.displayName || res.normalizedUsername,
          localUser: res.localUser,
        });
      }
    } catch (err: any) {
      setErrorMsg(mapAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Top Accent */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-sky-500 to-teal-400" />

        {canDismiss && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close sign in dialog"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="p-6 sm:p-7 space-y-5">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <StudyFlowLogo variant="horizontal" size="sm" glow={true} animate={false} />
            <h2 id="auth-modal-title" className="text-xl font-extrabold text-white tracking-tight pt-1">
              Sign in to StudyFlow
            </h2>
            <p className="text-xs text-slate-400 max-w-xs">
              Connect your <strong className="text-slate-200">Gmail</strong> for Parent Progress Reports &amp; Cloud Sync, or use a <strong className="text-slate-200">Username &amp; Password</strong>.
            </p>
          </div>

          {/* Official Google / Gmail Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-slate-100 text-[#1f1f1f] font-semibold text-sm border border-[#747775]/40 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span>Continue with Gmail (Google)</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="uppercase tracking-wider font-semibold">or use Username &amp; Password</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Sign In / Create Account Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === 'signin'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === 'signup'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            {tab === 'signin' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. aarav_10 or student@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username (e.g. aarav_10)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email <span className="text-slate-500 font-normal">(optional, enables cloud verification)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@gmail.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Please wait...' : tab === 'signin' ? 'Sign In with Password' : 'Create StudyFlow Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Guest Access */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Secure Auth • Pro Ultra Free
            </span>
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Continue as Guest</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
