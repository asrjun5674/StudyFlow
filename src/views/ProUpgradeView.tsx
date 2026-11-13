import React, { useState } from 'react';
import {
  Crown,
  Sparkles,
  Check,
  Copy,
  Smartphone,
  ShieldCheck,
  Zap,
  Receipt,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
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
  UpiPaymentReceipt,
} from '../types';
import {
  PRO_PLANS,
  ProPlanSpec,
  UPI_NUMBER,
  UPI_VPA,
  buildUpiPaymentUri,
  validateUtrReference,
} from '../utils/proAndPlugins';
import { UpiQrCode } from '../components/UpiQrCode';
import { ParentReportPlugin } from '../components/ParentReportPlugin';

interface ProUpgradeViewProps {
  profile: StudentProfile;
  tasks: PlannerTask[];
  subjects: Subject[];
  focusRecords: FocusRecord[];
  planTier: PlanTier;
  upiReceipts: UpiPaymentReceipt[];
  parentContact: ParentContactConfig;
  parentReports: ParentReportRecord[];
  onUpgradePlan: (receipt: UpiPaymentReceipt) => void;
  onActivateFreePro: () => void;
  onSaveParentContact: (cfg: ParentContactConfig) => void;
  onRecordReport: (record: ParentReportRecord) => void;
  onNavigate: (section: NavigationSection) => void;
}

export const ProUpgradeView: React.FC<ProUpgradeViewProps> = ({
  profile,
  tasks,
  subjects,
  focusRecords,
  planTier,
  upiReceipts,
  parentContact,
  parentReports,
  onUpgradePlan,
  onActivateFreePro,
  onSaveParentContact,
  onRecordReport,
  onNavigate,
}) => {
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<ProPlanSpec>(
    () => PRO_PLANS.find((p) => p.id === 'pro_ultra') || PRO_PLANS[2]
  );
  const [utrInput, setUtrInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const upiUri = buildUpiPaymentUri({
    amountInr: selectedCheckoutPlan.priceInr || 149,
    planName: selectedCheckoutPlan.name,
  });

  const handleCopy = (label: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleVerifyUpiPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (selectedCheckoutPlan.id === 'free') {
      setFeedback({ type: 'error', text: 'Select StudyFlow Plus (₹149) or Pro Ultra (₹299) to upgrade.' });
      return;
    }

    const check = validateUtrReference(utrInput);
    if (!check.valid) {
      setFeedback({ type: 'error', text: check.error || 'Invalid UTR reference.' });
      return;
    }

    const receipt: UpiPaymentReceipt = {
      id: `pay_${Date.now()}`,
      planTier: selectedCheckoutPlan.id,
      amountInr: selectedCheckoutPlan.priceInr,
      upiPayee: UPI_VPA,
      utrNumber: check.cleaned,
      timestamp: new Date().toISOString(),
      status: 'verified',
    };

    onUpgradePlan(receipt);
    setUtrInput('');
    setFeedback({
      type: 'success',
      text: `${selectedCheckoutPlan.name} unlocked! Better Gemini AI & Parent Connect plugins are now active.`,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-emerald-950/30 to-slate-900 border border-emerald-500/40 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            StudyFlow Pro Ultra • Unlocked Free For Now
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pro Ultra Unlocked Free!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            For now, <strong className="text-emerald-300">StudyFlow Pro Ultra</strong> is unlocked <strong className="text-white">100% free</strong> for you — including <strong className="text-emerald-300">Gemini 4 Argon Deep Thinking AI</strong>, Visual Homework Scanner, and <strong className="text-sky-300">WhatsApp &amp; Gmail Parent Progress Plugins</strong>. Optional UPI support via <span className="font-mono text-amber-300">{UPI_VPA}</span> remains available below.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
              Current Active Tier
            </span>
            <span className="text-sm font-extrabold text-emerald-400">
              {PRO_PLANS.find((p) => p.id === planTier)?.name || 'StudyFlow Pro Ultra'}
              {planTier === 'pro_ultra' ? ' (Free Active)' : ''}
            </span>
          </div>
          {planTier !== 'pro_ultra' && (
            <button
              type="button"
              onClick={() => {
                onActivateFreePro();
                setFeedback({
                  type: 'success',
                  text: 'StudyFlow Pro Ultra activated for free! All AI models & Parent Plugins are now unlocked.',
                });
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Activate Pro Ultra Free Now (₹0)
            </button>
          )}
        </div>
      </div>

      {/* Pricing Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRO_PLANS.map((plan) => {
          const isCurrent = planTier === plan.id;
          const isSelectedForCheckout = selectedCheckoutPlan.id === plan.id;
          const isUltra = plan.id === 'pro_ultra';

          return (
            <div
              key={plan.id}
              className={`rounded-3xl border p-6 flex flex-col justify-between space-y-5 transition-all ${
                isUltra
                  ? 'bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 border-amber-500/50 shadow-xl shadow-amber-500/10'
                  : isSelectedForCheckout
                  ? 'bg-slate-900 border-emerald-500/60 shadow-lg'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isUltra
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    {plan.badge}
                  </span>
                  {isCurrent && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-white">{plan.name}</h2>
                  <div className="text-2xl font-black text-white font-mono mt-1">
                    {plan.priceInr === 0 ? '₹0' : `₹${plan.priceInr}`}
                    <span className="text-xs font-normal text-slate-400 ml-1">
                      {plan.priceInr === 0 ? '/ Free Forever' : '/ month via UPI'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">{plan.tagline}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Gemini Models Included
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.aiModels.map((m) => (
                      <span
                        key={m}
                        className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-sky-300"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {plan.id === 'free' ? (
                <button
                  type="button"
                  onClick={() => onNavigate('ai')}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs cursor-pointer"
                >
                  Use Flash AI Companion
                </button>
              ) : isUltra && planTier !== 'pro_ultra' ? (
                <button
                  type="button"
                  onClick={() => {
                    onActivateFreePro();
                    setFeedback({
                      type: 'success',
                      text: 'StudyFlow Pro Ultra unlocked for free! All AI models & Parent Plugins are active.',
                    });
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/20"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Activate Pro Ultra Free Now (₹0)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => (isUltra && isCurrent ? onNavigate('ai') : setSelectedCheckoutPlan(plan))}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    isUltra
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>
                    {isUltra && isCurrent
                      ? 'Active Free • Open Pro AI'
                      : isCurrent
                      ? 'Extend / Re-verify UPI'
                      : `Select ${plan.name} (₹${plan.priceInr})`}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* UPI Checkout Panel (9841092311) */}
      <div className="rounded-3xl bg-slate-900/95 border border-emerald-500/30 p-6 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-extrabold text-white">
                Optional Supporter UPI Payment — {selectedCheckoutPlan.name} (₹{selectedCheckoutPlan.priceInr || 149})
              </h3>
              <p className="text-xs text-slate-400">
                Pro Ultra is already unlocked free! Optionally support or verify via GPay / PhonePe / Paytm / BHIM to <strong className="text-emerald-300 font-mono">{UPI_NUMBER}</strong>
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 font-mono bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Official UPI Payee Verified
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* QR Code */}
          <div className="lg:col-span-5 flex justify-center">
            <UpiQrCode
              upiUri={upiUri}
              amountInr={selectedCheckoutPlan.priceInr || 149}
              planName={selectedCheckoutPlan.name}
            />
          </div>

          {/* Payment Details & UTR Verification */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">UPI Mobile Number</span>
                  <span className="text-sm font-extrabold font-mono text-white">{UPI_NUMBER}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('num', UPI_NUMBER)}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 cursor-pointer"
                  aria-label="Copy UPI mobile number"
                >
                  {copiedKey === 'num' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">UPI ID (VPA)</span>
                  <span className="text-sm font-extrabold font-mono text-emerald-300">{UPI_VPA}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('vpa', UPI_VPA)}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 cursor-pointer"
                  aria-label="Copy UPI ID"
                >
                  {copiedKey === 'vpa' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <a
              href={upiUri}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Open Mobile UPI App (GPay / PhonePe / Paytm)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            {feedback && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            <form onSubmit={handleVerifyUpiPayment} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enter 12-Digit UPI Transaction / UTR Reference ID after paying ₹{selectedCheckoutPlan.priceInr || 149}
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value)}
                    placeholder="e.g. 431982041122 (UTR / Ref No.)"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Verify UPI &amp; Unlock</span>
                  </button>
                </div>
              </div>
            </form>

            {upiReceipts.length > 0 && (
              <div className="pt-2 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified UPI Upgrade Receipts</span>
                </div>
                {upiReceipts.slice(0, 3).map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold uppercase text-[10px]">
                        {rec.planTier === 'pro_ultra' ? 'Pro Ultra' : 'Plus'}
                      </span>
                      <span className="font-mono text-slate-200">UTR: {rec.utrNumber}</span>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold">₹{rec.amountInr} • Verified</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Parent Progress Plugins Section */}
      <ParentReportPlugin
        profile={profile}
        tasks={tasks}
        subjects={subjects}
        focusRecords={focusRecords}
        planTier={planTier}
        parentContact={parentContact}
        parentReports={parentReports}
        onSaveParentContact={onSaveParentContact}
        onRecordReport={onRecordReport}
        onNavigate={onNavigate}
      />
    </div>
  );
};
