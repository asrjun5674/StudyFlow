import React, { useMemo, useState } from 'react';
import {
  MessageCircle,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Crown,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  X,
  UserCheck,
  Clock,
} from 'lucide-react';
import {
  FocusRecord,
  NavigationSection,
  ParentContactConfig,
  ParentReportRecord,
  PlanTier,
  PlannerTask,
  StudentProfile,
  Subject,
} from '../types';
import {
  buildParentProgressSummary,
  buildWhatsAppShareUrl,
  formatParentEmailReport,
  formatParentWhatsAppText,
} from '../utils/proAndPlugins';
import {
  authorizeGmailPlugin,
  getGmailAccessToken,
  sendEmailViaGmailApi,
} from '../utils/firebase';

interface ParentReportPluginProps {
  profile: StudentProfile;
  tasks: PlannerTask[];
  subjects: Subject[];
  focusRecords: FocusRecord[];
  planTier: PlanTier;
  parentContact: ParentContactConfig;
  parentReports: ParentReportRecord[];
  onSaveParentContact: (cfg: ParentContactConfig) => void;
  onRecordReport: (record: ParentReportRecord) => void;
  onNavigate?: (section: NavigationSection) => void;
}

export const ParentReportPlugin: React.FC<ParentReportPluginProps> = ({
  profile,
  tasks,
  subjects,
  focusRecords,
  planTier,
  parentContact,
  parentReports,
  onSaveParentContact,
  onRecordReport,
  onNavigate,
}) => {
  const [parentName, setParentName] = useState(parentContact.parentName);
  const [parentWhatsapp, setParentWhatsapp] = useState(parentContact.parentWhatsapp);
  const [parentEmail, setParentEmail] = useState(parentContact.parentEmail);
  const [savedToast, setSavedToast] = useState(false);

  const [gmailConnected, setGmailConnected] = useState<boolean>(() => Boolean(getGmailAccessToken()));
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [sendingGmail, setSendingGmail] = useState(false);
  const [confirmEmailModal, setConfirmEmailModal] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedPreview, setCopiedPreview] = useState(false);

  const summary = useMemo(
    () =>
      buildParentProgressSummary({
        profile,
        tasks,
        subjects,
        focusRecords,
      }),
    [profile, tasks, subjects, focusRecords]
  );

  const whatsappText = useMemo(
    () => formatParentWhatsAppText(summary, parentName),
    [summary, parentName]
  );

  const emailDraft = useMemo(
    () => formatParentEmailReport(summary, parentName),
    [summary, parentName]
  );

  const waUrl = useMemo(
    () => buildWhatsAppShareUrl(parentWhatsapp, whatsappText),
    [parentWhatsapp, whatsappText]
  );

  const whatsappUnlocked = planTier === 'plus' || planTier === 'pro_ultra';
  const gmailUnlocked = planTier === 'pro_ultra';

  const handleSaveContacts = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveParentContact({
      parentName: parentName.trim(),
      parentEmail: parentEmail.trim(),
      parentWhatsapp: parentWhatsapp.trim(),
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  const handleWhatsAppClick = () => {
    onSaveParentContact({
      parentName: parentName.trim(),
      parentEmail: parentEmail.trim(),
      parentWhatsapp: parentWhatsapp.trim(),
    });
    const rec: ParentReportRecord = {
      id: `rep_${Date.now()}`,
      channel: 'whatsapp',
      recipient: parentWhatsapp.trim() || 'WhatsApp Contact',
      completionRate: summary.completionRate,
      weeklyFocusMinutes: summary.weeklyFocusMinutes,
      streakDays: summary.streakDays,
      timestamp: new Date().toISOString(),
      status: 'opened',
    };
    onRecordReport(rec);
    setStatusBanner({
      type: 'success',
      text: 'WhatsApp progress message prepared & logged! Complete sending inside WhatsApp.',
    });
  };

  const handleConnectGmail = async () => {
    setStatusBanner(null);
    setConnectingGmail(true);
    try {
      await authorizeGmailPlugin();
      setGmailConnected(true);
      setStatusBanner({
        type: 'success',
        text: 'Gmail send permission authorized for this session! You can now send parent progress reports.',
      });
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        text: err?.message || 'Could not authorize Gmail send scope.',
      });
    } finally {
      setConnectingGmail(false);
    }
  };

  const handleConfirmSendGmail = async () => {
    const targetEmail = parentEmail.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setStatusBanner({ type: 'error', text: 'Enter a valid Parent Gmail/Email address first.' });
      setConfirmEmailModal(false);
      return;
    }

    setSendingGmail(true);
    setStatusBanner(null);
    try {
      await sendEmailViaGmailApi({
        to: targetEmail,
        subject: emailDraft.subject,
        body: emailDraft.body,
      });

      onSaveParentContact({
        parentName: parentName.trim(),
        parentEmail: targetEmail,
        parentWhatsapp: parentWhatsapp.trim(),
      });

      const rec: ParentReportRecord = {
        id: `rep_${Date.now()}`,
        channel: 'gmail',
        recipient: targetEmail,
        completionRate: summary.completionRate,
        weeklyFocusMinutes: summary.weeklyFocusMinutes,
        streakDays: summary.streakDays,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };
      onRecordReport(rec);
      setConfirmEmailModal(false);
      setStatusBanner({
        type: 'success',
        text: `Progress report successfully emailed to ${targetEmail} via Gmail!`,
      });
    } catch (err: any) {
      setGmailConnected(Boolean(getGmailAccessToken()));
      setStatusBanner({
        type: 'error',
        text: err?.message || 'Failed to send Gmail progress report.',
      });
      setConfirmEmailModal(false);
    } finally {
      setSendingGmail(false);
    }
  };

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2000);
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            Parent Progress Connect Plugins
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            WhatsApp &amp; Gmail Parent Progress Reporter
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatically compiles completed homework %, focus minutes, streak &amp; chapter mastery and sends it straight to your parent.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
              planTier === 'pro_ultra'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : planTier === 'plus'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            {planTier === 'pro_ultra'
              ? 'Pro Ultra: WhatsApp + Gmail Active'
              : planTier === 'plus'
              ? 'Plus: WhatsApp Active'
              : 'Starter Free Tier'}
          </span>
        </div>
      </div>

      {/* Live Snapshot Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Tasks Finished</span>
          <span className="text-lg font-extrabold text-emerald-400 font-mono">
            {summary.completedTasks}/{summary.totalTasks} ({summary.completionRate}%)
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Syllabus Mastery</span>
          <span className="text-lg font-extrabold text-sky-400 font-mono">
            {summary.overallMasteryPercent}%
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Weekly Focus</span>
          <span className="text-lg font-extrabold text-white font-mono">
            {summary.weeklyFocusMinutes} min
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Study Streak</span>
          <span className="text-lg font-extrabold text-amber-400 font-mono">
            {summary.streakDays} Days
          </span>
        </div>
      </div>

      {statusBanner && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            statusBanner.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
          }`}
        >
          {statusBanner.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <span>{statusBanner.text}</span>
        </div>
      )}

      {/* Parent Contact Configuration Form */}
      <form onSubmit={handleSaveContacts} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Parent / Guardian Name</label>
          <input
            type="text"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="e.g. Mrs. Priya"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Parent WhatsApp Number</label>
          <input
            type="tel"
            value={parentWhatsapp}
            onChange={(e) => setParentWhatsapp(e.target.value)}
            placeholder="e.g. 1111111111"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Parent Gmail / Email</label>
          <input
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            placeholder="e.g. parent@gmail.com"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 cursor-pointer flex items-center justify-center gap-1.5"
        >
          {savedToast ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Saved!</span>
            </>
          ) : (
            <span>Save Parent Contact</span>
          )}
        </button>
      </form>

      {/* Live Message Preview + Dispatch Plugins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Preview Box */}
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Live Report Message Preview</span>
            <button
              type="button"
              onClick={handleCopyPreview}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              {copiedPreview ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedPreview ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
          <pre className="text-[11px] text-slate-300 whitespace-pre-wrap font-sans leading-relaxed max-h-56 overflow-y-auto bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            {whatsappText}
          </pre>
        </div>

        {/* Plugin Dispatch Cards */}
        <div className="space-y-3">
          {/* WhatsApp Plugin Card */}
          <div className="rounded-2xl bg-slate-950 border border-emerald-500/25 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">WhatsApp Parent Plugin</h4>
                  <p className="text-[11px] text-slate-400">Instant formatted progress card via WhatsApp</p>
                </div>
              </div>
              {!whatsappUnlocked && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  Plus / Pro Ultra
                </span>
              )}
            </div>

            {whatsappUnlocked ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Progress via WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate?.('pro')}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Crown className="w-4 h-4" />
                <span>Unlock WhatsApp Plugin with UPI (₹149)</span>
              </button>
            )}
          </div>

          {/* Gmail Plugin Card */}
          <div className="rounded-2xl bg-slate-950 border border-sky-500/25 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Gmail Direct Parent Plugin</h4>
                  <p className="text-[11px] text-slate-400">Sends official progress summary directly via Gmail API</p>
                </div>
              </div>
              {!gmailUnlocked && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  Pro Ultra
                </span>
              )}
            </div>

            {gmailUnlocked ? (
              <div className="flex flex-wrap gap-2">
                {!gmailConnected ? (
                  <button
                    type="button"
                    onClick={handleConnectGmail}
                    disabled={connectingGmail}
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{connectingGmail ? 'Connecting Gmail...' : 'Connect Gmail Permission to Send'}</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (!parentEmail.trim() || !parentEmail.includes('@')) {
                          setStatusBanner({
                            type: 'error',
                            text: 'Please enter a valid Parent Gmail address above before sending.',
                          });
                          return;
                        }
                        setConfirmEmailModal(true);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-600/20 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Progress via Gmail</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleConnectGmail}
                      className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-semibold cursor-pointer"
                      title="Refresh Gmail OAuth token"
                    >
                      Reconnect
                    </button>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate?.('pro')}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Crown className="w-4 h-4" />
                <span>Unlock Gmail Parent Plugin with UPI (₹299)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recent Dispatched Reports Log */}
      {parentReports.length > 0 && (
        <div className="pt-2 space-y-2">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Recent Parent Reports Log</span>
          </h4>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {parentReports.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 font-semibold uppercase text-[10px]">
                    {r.channel}
                  </span>
                  <span className="text-slate-200 font-medium">{r.recipient}</span>
                  <span className="text-slate-500">
                    • {r.completionRate}% tasks • {r.weeklyFocusMinutes}m focus
                  </span>
                </div>
                <span className="text-emerald-400 font-mono">
                  {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Explicit Confirmation Modal before sending Gmail */}
      {confirmEmailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gmail-confirm-title"
        >
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-sky-400" />
                <h4 id="gmail-confirm-title" className="text-base font-extrabold text-white">
                  Confirm Sending Parent Report via Gmail
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setConfirmEmailModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Cancel sending email"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <div>
                <span className="text-slate-400 font-semibold">To: </span>
                <span className="text-sky-300 font-mono">{parentEmail.trim()}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Subject: </span>
                <span className="text-white font-semibold">{emailDraft.subject}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Message Preview:</span>
                <pre className="whitespace-pre-wrap font-sans text-[11px] text-slate-300 max-h-48 overflow-y-auto">
                  {emailDraft.body}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmEmailModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSendGmail}
                disabled={sendingGmail}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingGmail ? 'Sending via Gmail...' : 'Confirm & Send Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
