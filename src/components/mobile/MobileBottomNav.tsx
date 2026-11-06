import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Brain,
  Calendar,
  CheckCircle2,
  Grid,
  Sparkles,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
  isMenuOpen: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu, isMenuOpen }) => {
  const { activeTab, setActiveTab, tasks, revisionItems, flashcards } = useApp();

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const tabs = [
    { id: 'overview', label: 'Today', icon: LayoutDashboard },
    { id: 'tutor', label: 'AI Tutor', icon: Brain, special: true },
    { id: 'planner', label: 'Planner', icon: Calendar, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'practice', label: 'Tests', icon: CheckCircle2 },
    { id: 'menu', label: 'Modules', icon: Grid, isMenuTrigger: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800 pb-safe shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.isMenuTrigger ? isMenuOpen : activeTab === tab.id && !isMenuOpen;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.isMenuTrigger) {
                  onOpenMenu();
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className="relative flex flex-col items-center justify-center h-full py-1 text-center group active:scale-95 transition-transform"
            >
              {tab.special ? (
                <div
                  className={`w-10 h-10 -mt-4 rounded-2xl flex items-center justify-center text-white shadow-md transition-all ${
                    isActive
                      ? 'bg-indigo-600 shadow-indigo-500/40 scale-105'
                      : 'bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-indigo-500/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600'
                    }`}
                  />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[9px] font-extrabold text-white flex items-center justify-center tabular-nums">
                      {tab.badge}
                    </span>
                  )}
                </div>
              )}

              <span
                className={`text-[10px] font-semibold tracking-tight mt-1 transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
