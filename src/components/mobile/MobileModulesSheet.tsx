import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Brain,
  Calendar,
  FileText,
  Layers,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  BarChart3,
  Library,
  Settings,
  Mail,
  CreditCard,
  Download,
  X,
  Flame,
  Zap,
  ShieldCheck,
} from 'lucide-react';

interface MobileModulesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEmails: () => void;
}

export const MobileModulesSheet: React.FC<MobileModulesSheetProps> = ({
  isOpen,
  onClose,
  onOpenEmails,
}) => {
  const {
    activeTab,
    setActiveTab,
    user,
    setSubscriptionModalOpen,
    tasks,
    revisionItems,
    flashcards,
  } = useApp();

  if (!isOpen) return null;

  const modules = [
    { id: 'overview', label: 'Today’s Overview', icon: LayoutDashboard, color: 'text-blue-500' },
    { id: 'tutor', label: 'AI Tutor', icon: Brain, color: 'text-indigo-500', highlight: true },
    { id: 'planner', label: 'Study Planner', icon: Calendar, color: 'text-emerald-500', badge: tasks.filter((t) => !t.completed).length },
    { id: 'notes', label: 'Smart Notes', icon: FileText, color: 'text-amber-500' },
    { id: 'flashcards', label: 'AI Flashcards', icon: Layers, color: 'text-violet-500', badge: flashcards.filter((f) => f.leitnerBox <= 2).length },
    { id: 'practice', label: 'Practice Tests', icon: CheckCircle2, color: 'text-teal-500' },
    { id: 'revision', label: 'Revision Centre', icon: RotateCcw, color: 'text-rose-500', badge: revisionItems.length },
    { id: 'subjects', label: 'My Subjects', icon: BookOpen, color: 'text-cyan-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-orange-500' },
    { id: 'library', label: 'Study Library', icon: Library, color: 'text-purple-500' },
    { id: 'cybershield', label: 'CyberShield Lab', icon: ShieldCheck, color: 'text-emerald-500', alert: 'Armor' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-slate-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl p-6 shadow-2xl border-t border-slate-200 dark:border-slate-800 space-y-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 pb-12">
        {/* Drag handle */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              STUDYOS by bhaleinc
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">All Academic Modules</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = activeTab === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveTab(m.id);
                  onClose();
                }}
                className={`p-3 rounded-2xl flex flex-col items-center text-center relative border transition-all active:scale-95 ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 ${
                    isActive ? 'bg-white/20 text-white' : m.color
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] font-semibold tracking-tight leading-tight ${
                    isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {m.label}
                </span>

                {m.badge !== undefined && m.badge > 0 && (
                  <span className="absolute top-2 right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[9px] font-extrabold text-white flex items-center justify-center tabular-nums">
                    {m.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Utility Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenEmails();
            }}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <Mail className="w-4 h-4 text-indigo-500" />
            <span>Emails & Invoices</span>
          </button>

          <button
            onClick={() => {
              onClose();
              setSubscriptionModalOpen(true);
            }}
            className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300"
          >
            <CreditCard className="w-4 h-4" />
            <span>Billing & Plans</span>
          </button>
        </div>
      </div>
    </div>
  );
};
