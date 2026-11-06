import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Award,
  Flame,
  Zap,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { user, tasks, testAttempts, badges } = useApp();

  const completedTasks = tasks.filter((t) => t.completed).length;
  const avgTestScore = testAttempts.length > 0
    ? Math.round(testAttempts.reduce((acc, a) => acc + a.percentage, 0) / testAttempts.length)
    : 75;

  const weeklyData = [
    { day: 'M', hours: 3.2 },
    { day: 'T', hours: 4.0 },
    { day: 'W', hours: 2.8 },
    { day: 'T', hours: 3.5 },
    { day: 'F', hours: 4.2 },
    { day: 'S', hours: 5.0 },
    { day: 'S', hours: 3.1 },
  ];

  return (
    <div className="p-3.5 sm:p-4 max-w-md mx-auto w-full min-w-0 overflow-x-hidden space-y-3.5 transition-colors">
      {/* Phone Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Diagnostics · by bhaleinc
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">
            Analytics
          </h1>
        </div>

        <div className="flex items-center gap-1 bg-amber-50 dark:bg-slate-800 border border-amber-200/70 dark:border-slate-700 px-2.5 py-1 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums shrink-0">
          <Flame className="w-3.5 h-3.5 fill-amber-500" />
          <span>{user?.streakDays || 8}d Streak</span>
        </div>
      </div>

      {/* 4 KPI Metric Cards: 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 min-w-0">
          <p className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold truncate">
            <Clock className="w-3 h-3 text-indigo-600 shrink-0" />
            <span className="truncate">This Week</span>
          </p>
          <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">25.8 <span className="text-[10px] font-medium text-slate-400">hrs</span></p>
          <p className="text-[10px] text-emerald-600 font-bold">+14% vs last week</p>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 min-w-0">
          <p className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold truncate">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">Tasks Done</span>
          </p>
          <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{completedTasks} <span className="text-[10px] font-medium text-slate-400">tasks</span></p>
          <p className="text-[10px] text-slate-400">Paced daily</p>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 min-w-0">
          <p className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold truncate">
            <TrendingUp className="w-3 h-3 text-violet-600 shrink-0" />
            <span className="truncate">Test Accuracy</span>
          </p>
          <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{avgTestScore}%</p>
          <p className="text-[10px] text-emerald-600 font-bold">Passing threshold</p>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 min-w-0">
          <p className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold truncate">
            <Zap className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="truncate">Earned XP</span>
          </p>
          <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{user?.xp || 1420} <span className="text-[10px] font-medium text-slate-400">XP</span></p>
          <p className="text-[10px] text-indigo-600 font-bold">Level 7 Scholar</p>
        </div>
      </div>

      {/* Weekly Study Time Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-3 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">Daily Focus Distribution</h2>
            <p className="text-[10px] text-slate-400">Hours spent vs 3.5h target</p>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
            Target Met
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 items-end h-32 pt-4 pb-1">
          {weeklyData.map((d, idx) => {
            const heightPct = Math.min(100, (d.hours / 6) * 100);
            return (
              <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end min-w-0">
                <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                  {d.hours}
                </span>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-full flex items-end overflow-hidden">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-violet-500 rounded-t-md transition-all"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gamification Achievements */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-3 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">Badges & Milestones</h2>
          </div>
          <span className="text-[11px] text-slate-400 tabular-nums">
            {badges.filter((b) => b.unlocked).length} / {badges.length}
          </span>
        </div>

        <div className="space-y-2">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all min-w-0 ${
                b.unlocked
                  ? 'bg-amber-50/40 dark:bg-slate-800/80 border-amber-200/80 dark:border-amber-900/60'
                  : 'bg-slate-50/40 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800 opacity-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  b.unlocked
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                }`}
              >
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{b.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{b.description}</p>
              </div>
              {b.unlocked && (
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded shrink-0">
                  Earned
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
