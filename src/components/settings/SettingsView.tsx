import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Shield,
  CreditCard,
  Mail,
  Download,
  CheckCircle2,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react';

export const SettingsView: React.FC<{ onOpenEmails: () => void }> = ({ onOpenEmails }) => {
  const {
    user,
    updateProfile,
    isDarkMode,
    toggleDarkMode,
    setSubscriptionModalOpen,
    tasks,
    notes,
    flashcards,
    logout,
  } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [educationLevel, setEducationLevel] = useState(user?.educationLevel || 'College/University');
  const [studyHours, setStudyHours] = useState(user?.preferredStudyHoursPerDay || 3.5);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      institution,
      educationLevel: educationLevel as any,
      preferredStudyHoursPerDay: studyHours,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportData = () => {
    const data = {
      user,
      tasks,
      notes,
      flashcards,
      exportedAt: new Date().toISOString(),
      platform: 'STUDYOS by bhaleinc',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyos_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3.5 sm:p-4 max-w-md mx-auto w-full min-w-0 overflow-x-hidden space-y-3.5 transition-colors">
      {/* Phone Header */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Settings · by bhaleinc
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Account & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
          Manage your personal study parameters, auth providers, and billing.
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-3 min-w-0">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <User className="w-4 h-4 text-indigo-600" />
          <span>Student Profile</span>
        </h2>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Email (Connected)</label>
            <input
              type="email"
              disabled
              value={user?.email || 'sarah.j@university.edu'}
              className="mt-1 w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Level</label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value as any)}
                className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="Middle School">Middle School</option>
                <option value="High School">High School</option>
                <option value="College/University">College/Univ</option>
                <option value="Competitive Exam Aspirant">Aspirant</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Department</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Engineering"
                className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              <span>Daily Target Hours</span>
              <span className="font-bold text-indigo-600">{studyHours} hrs</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={studyHours}
              onChange={(e) => setStudyHours(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 mt-1 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {savedSuccess ? (
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Subscription & Payment Gateway */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-2.5 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">Subscription & Billing</h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
            {user?.plan === 'plus' ? 'Student Plus' : user?.plan === 'pro' ? 'Student Pro' : 'Free Plan'}
          </span>
        </div>

        <p className="text-[11px] text-slate-500 leading-snug">
          Integrated with <strong>Razorpay (UPI)</strong> and <strong>Stripe (Global)</strong>.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setSubscriptionModalOpen(true)}
            className="py-2 px-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs text-center"
          >
            Manage Plan
          </button>

          <button
            onClick={onOpenEmails}
            className="py-2 px-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Invoices</span>
          </button>
        </div>
      </div>

      {/* Appearance Theme */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm flex items-center justify-between min-w-0">
        <div>
          <h2 className="text-xs font-bold text-slate-900 dark:text-white">App Color Theme</h2>
          <p className="text-[10px] text-slate-400">Toggle light study / OLED dark</p>
        </div>

        <button
          onClick={toggleDarkMode}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
          <span>{isDarkMode ? 'Dark' : 'Light'}</span>
        </button>
      </div>

      {/* Data Export & Account Reset */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-2.5 min-w-0">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Data Privacy & Portability</span>
        </h2>
        <p className="text-[11px] text-slate-500 leading-snug">
          Your notes, study schedule, and diagnostic scores are private. Export anytime in JSON.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExportData}
            className="py-2 px-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={logout}
            className="py-2 px-2 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Company Branding */}
      <div className="text-center py-2 text-[10px] text-slate-400 space-y-0.5">
        <p className="font-semibold text-slate-600 dark:text-slate-400">STUDYOS Mobile Edition · v2.4.0</p>
        <p>Architected & Made with precision by <strong>bhaleinc</strong></p>
      </div>
    </div>
  );
};
