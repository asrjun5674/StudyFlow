import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  Moon,
  Sun,
  BookOpen,
  Volume2,
  Play,
  Square,
  Sparkles,
} from 'lucide-react';
import { SmartAlarm } from '../types';
import { AlarmAudio } from '../utils/alarmAudio';

interface SmartAlarmsViewProps {
  alarms: SmartAlarm[];
  onAddAlarm: (alarm: Omit<SmartAlarm, 'id'>) => void;
  onToggleAlarm: (alarmId: string) => void;
  onDeleteAlarm: (alarmId: string) => void;
  onTestRing?: (alarm: SmartAlarm) => void;
  onTriggerAlarmTest?: (alarm: SmartAlarm) => void;
}

export const SmartAlarmsView: React.FC<SmartAlarmsViewProps> = ({
  alarms,
  onAddAlarm,
  onToggleAlarm,
  onDeleteAlarm,
  onTestRing,
  onTriggerAlarmTest,
}) => {
  const triggerRing = onTestRing || onTriggerAlarmTest;
  const [showAddModal, setShowAddModal] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [isTestingChime, setIsTestingChime] = useState(false);

  // Live clock updates every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Form state
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('06:00');
  const [type, setType] = useState<SmartAlarm['type']>('study');
  const [label, setLabel] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') {
      setNotificationStatus('denied');
      return;
    }
    const perm = await Notification.requestPermission();
    setNotificationStatus(perm);
  };

  const handleTestChime = () => {
    if (isTestingChime) {
      AlarmAudio.stopRinging();
      setIsTestingChime(false);
    } else {
      setIsTestingChime(true);
      AlarmAudio.playMelodicPhrase();
      setTimeout(() => setIsTestingChime(false), 2000);
    }
  };

  const handleCreateAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddAlarm({
      title: title.trim(),
      time,
      type,
      days: selectedDays,
      enabled: true,
      label: label.trim() || undefined,
    });

    setTitle('');
    setLabel('');
    setShowAddModal(false);
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const getTypeIcon = (t: SmartAlarm['type']) => {
    switch (t) {
      case 'wakeup':
        return Sun;
      case 'bedtime':
        return Moon;
      case 'study':
      case 'homework':
      case 'exam':
        return BookOpen;
      default:
        return Bell;
    }
  };

  // Find next enabled alarm
  const enabledAlarms = alarms.filter((a) => a.enabled);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner with Live Clock & Test Chime */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-950/20 to-slate-900 border border-amber-500/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-500/30">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            Working Smart Alarms &amp; Study Reminders
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Smart Alarms &amp; Routine Chimes
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Alarms ring automatically with a pleasant melodic chime when the time arrives, even while working on other tabs or views.
          </p>
        </div>

        {/* Live Clock & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Clock */}
          <div className="px-4 py-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-amber-300 font-mono text-xs flex items-center gap-2 shadow-inner">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '60s' }} />
            <div>
              <span className="text-[10px] uppercase text-slate-400 block -mb-0.5">Current Time</span>
              <span className="text-base font-bold text-white">{currentTimeStr || '--:--:--'}</span>
            </div>
          </div>

          {/* Test Sound Button */}
          <button
            type="button"
            onClick={handleTestChime}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs border transition-all cursor-pointer ${
              isTestingChime
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                : 'bg-slate-900 text-amber-300 border-amber-500/30 hover:bg-slate-800'
            }`}
            title="Preview the melodic chime sound"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isTestingChime ? 'Playing Chime...' : 'Test Sound'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Alarm</span>
          </button>
        </div>
      </div>

      {/* Browser Notification Info Box */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Real-time audio chime is <strong>100% active</strong>. {enabledAlarms.length} alarm(s) armed and monitoring.
          </span>
        </div>

        {notificationStatus !== 'granted' && (
          <button
            onClick={requestNotificationPermission}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 cursor-pointer"
          >
            Enable Desktop Popups
          </button>
        )}
      </div>

      {/* Alarms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alarms.map((alarm) => {
          const Icon = getTypeIcon(alarm.type);
          return (
            <div
              key={alarm.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                alarm.enabled
                  ? 'bg-white/95 dark:bg-slate-900/90 border-amber-500/30 dark:border-slate-800 shadow-sm hover:border-amber-400'
                  : 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/40 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      alarm.enabled
                        ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{alarm.title}</h4>
                    {alarm.label && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{alarm.label}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Test Alarm Trigger Button */}
                  {triggerRing && (
                    <button
                      type="button"
                      onClick={() => triggerRing(alarm)}
                      className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
                      title="Test this alarm ringing right now"
                    >
                      Ring Now
                    </button>
                  )}

                  <input
                    type="checkbox"
                    checked={alarm.enabled}
                    onChange={() => onToggleAlarm(alarm.id)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-0 cursor-pointer"
                    aria-label={`Toggle alarm ${alarm.title}`}
                  />
                  <button
                    onClick={() => onDeleteAlarm(alarm.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    aria-label={`Delete alarm ${alarm.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/60 text-xs font-mono">
                <span className="text-2xl font-bold text-slate-900 dark:text-amber-400 tracking-tight">
                  {alarm.time}
                </span>
                <div className="flex items-center gap-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                    <span
                      key={d}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        alarm.days.includes(d)
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold'
                          : 'text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      {d[0]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Alarm Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Smart Reminder</h3>

            <form onSubmit={handleCreateAlarm} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reminder Title:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Science Revision Hour"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time:
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category:
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-200"
                  >
                    <option value="study">Study Session</option>
                    <option value="homework">Homework Due</option>
                    <option value="wakeup">Morning Wake-up</option>
                    <option value="bedtime">Night Wind-down</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Active Days:
                </label>
                <div className="flex gap-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        selectedDays.includes(d)
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Motivational Note (Optional):
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Drink water &amp; grab highlighters!"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-amber-600/20"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
