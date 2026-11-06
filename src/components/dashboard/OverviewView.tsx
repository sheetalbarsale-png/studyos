import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Flame,
  Zap,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  BookOpen,
  Sparkles,
  RotateCcw,
  Plus,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const {
    user,
    tasks,
    toggleTask,
    addTask,
    revisionItems,
    setActiveTab,
  } = useApp();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState(user?.subjects?.[0] || 'Mathematics');

  const todayStr = '2026-11-06';
  const todaysTasks = tasks.filter((t) => t.dueDate === todayStr || !t.completed);
  const completedToday = tasks.filter((t) => t.completed).length;

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle.trim(),
      subject: newTaskSubject,
      dueDate: todayStr,
      durationMinutes: 45,
      difficulty: 'Medium',
      completed: false,
      scheduledTime: '03:00 PM',
    });
    setNewTaskTitle('');
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto w-full min-w-0 overflow-x-hidden transition-colors">
      {/* Phone-Optimized Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white p-4 shadow-sm min-w-0">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-indigo-300">
            <span className="truncate">{user?.institution || 'Academic Hub'}</span>
            <span className="tabular-nums shrink-0">Today, Nov 6</span>
          </div>

          <h1 className="text-xl font-extrabold tracking-tight truncate">
            Hi, {user?.name.split(' ')[0] || 'Scholar'}
          </h1>
          <p className="text-indigo-200 text-xs leading-relaxed line-clamp-2">
            "Understanding is deeper than knowledge. Learn with curiosity today."
          </p>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/10 flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold tabular-nums truncate">{user?.streakDays || 8} Days</p>
                <p className="text-[9px] text-indigo-200">Study Streak</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/10 flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-indigo-300 fill-indigo-300" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold tabular-nums truncate">{user?.xp || 1420} XP</p>
                <p className="text-[9px] text-indigo-200">Mastery Level</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm min-w-0 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Today’s Schedule</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              {completedToday} of {tasks.length} tasks completed
            </p>
          </div>
          <button
            onClick={() => setActiveTab('planner')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
          >
            <span>Planner</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Mobile Quick Task Add Bar */}
        <form onSubmit={handleQuickAddTask} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add task for today..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shrink-0"
            title="Add task"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        {/* Task List */}
        <div className="space-y-2">
          {todaysTasks.slice(0, 4).map((task) => (
            <div
              key={task.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 min-w-0 transition-all ${
                task.completed
                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 opacity-60'
                  : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="text-slate-400 hover:text-indigo-600 shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-semibold truncate ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {task.subject} · {task.durationMinutes}m
                  </p>
                </div>
              </div>

              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                  task.difficulty === 'Hard'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                    : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                }`}
              >
                {task.difficulty}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Examinations Countdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm min-w-0 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Target Exams</span>
          </h3>
          <span className="text-[11px] text-slate-400">Next 30 Days</span>
        </div>

        <div className="space-y-2">
          {user?.examinationDates?.slice(0, 3).map((exam, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between min-w-0 gap-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{exam.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{exam.subject}</p>
              </div>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums shrink-0">
                Nov 18
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Tutor One-Tap Recommendation */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-2 min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI Tutor Focus</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Vector Calculus exam in 12 days. Practice Green's Theorem boundary integrals with step-by-step guidance.
        </p>
        <button
          onClick={() => setActiveTab('tutor')}
          className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>Ask AI Tutor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
