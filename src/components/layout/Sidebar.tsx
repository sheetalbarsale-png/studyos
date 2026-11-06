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
  Flame,
  Zap,
  Sparkles,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const {
    activeTab,
    setActiveTab,
    user,
    tasks,
    revisionItems,
    flashcards,
    logout,
    setSubscriptionModalOpen,
    setQuickAssistantOpen,
  } = useApp();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tutor', label: 'AI Tutor', icon: Brain, highlight: true },
    { id: 'planner', label: 'Study Planner', icon: Calendar, badge: tasks.filter((t) => !t.completed).length },
    { id: 'notes', label: 'Smart Notes', icon: FileText },
    { id: 'flashcards', label: 'AI Flashcards', icon: Layers, badge: flashcards.filter((f) => f.leitnerBox <= 2).length },
    { id: 'practice', label: 'Practice Tests', icon: CheckCircle2 },
    { id: 'revision', label: 'Revision Centre', icon: RotateCcw, alert: revisionItems.length > 0 ? revisionItems.length : undefined },
    { id: 'subjects', label: 'My Subjects', icon: BookOpen },
    { id: 'analytics', label: 'Progress Analytics', icon: BarChart3 },
    { id: 'library', label: 'Study Library', icon: Library },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between py-4 px-3 select-none transition-colors ${className}`}
    >
      <div className="space-y-4">
        {/* Student Quick Profile & Gamification Stats */}
        {user && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl || '/src/assets/images/avatar_student_sarah_1793957070719.jpg'}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/30 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.educationLevel}</p>
              </div>
            </div>

            {/* Streak & XP Metric Row */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-center">
              <div className="bg-white dark:bg-slate-800 py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  {user.streakDays}d streak
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  {user.xp} XP
                </span>
              </div>
            </div>
          </div>
        )}

        {/* AI Quick Assistant Trigger */}
        <button
          onClick={() => setQuickAssistantOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200/80 dark:border-indigo-800/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>AI Study Assistant</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </button>

        {/* 11 Main Navigation Links */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.alert !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 font-bold rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                    }`}
                  >
                    {item.alert}
                  </span>
                )}
                {item.badge !== undefined && item.alert === undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 font-bold rounded-md ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Subscription Tier & Logout */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={() => setSubscriptionModalOpen(true)}
          className="w-full text-left p-2.5 rounded-lg bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              {user?.plan === 'plus' ? 'STUDENT PLUS' : user?.plan === 'pro' ? 'STUDENT PRO' : 'FREE PLAN'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Upgrade</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 truncate">
            Unlimited AI Tutor & Revision
          </p>
        </button>

        {user && (
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
};
