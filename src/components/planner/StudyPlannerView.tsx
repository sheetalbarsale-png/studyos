import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateAiStudyPlan } from '../../services/geminiClient';
import {
  Calendar as CalendarIcon,
  Sparkles,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Sliders,
  AlertCircle,
  Loader2,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const StudyPlannerView: React.FC = () => {
  const {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    addMultipleTasks,
    user,
  } = useApp();

  const [availableHours, setAvailableHours] = useState(user?.preferredStudyHoursPerDay || 3.5);
  const [selectedPlanType, setSelectedPlanType] = useState<'daily' | 'weekly' | 'exam_prep'>('daily');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // New task form state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(user?.subjects?.[0] || 'Mathematics');
  const [chapter, setChapter] = useState('');
  const [dueDate, setDueDate] = useState('2026-11-06');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [scheduledTime, setScheduledTime] = useState('10:00 AM');

  const handleGenerateAiPlan = async () => {
    setLoadingAi(true);
    setAiError(null);

    try {
      const generated = await generateAiStudyPlan({
        subjects: user?.subjects || ['Mathematics', 'Physics', 'Chemistry'],
        availableHours,
        examDates: user?.examinationDates || [],
        learningGoals: user?.learningGoals || [],
        planType: selectedPlanType,
      });

      if (generated && generated.length > 0) {
        const mapped = generated.map((t: any, i: number) => ({
          title: t.title || 'Master core chapter concepts',
          subject: t.subject || user?.subjects?.[0] || 'General',
          chapter: t.chapter || '',
          dueDate: '2026-11-06',
          durationMinutes: t.durationMinutes || 45,
          difficulty: (t.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
          completed: false,
          notes: t.notes || '',
          scheduledTime: `${9 + (i * 2)}:00 ${9 + (i * 2) >= 12 ? 'PM' : 'AM'}`,
          isAiGenerated: true,
        }));

        addMultipleTasks(mapped);
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Failed to generate AI study plan.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      subject,
      chapter: chapter.trim() || undefined,
      dueDate,
      durationMinutes,
      difficulty,
      completed: false,
      scheduledTime,
    });

    setTitle('');
    setChapter('');
    setTaskModalOpen(false);
  };

  return (
    <div className="p-3.5 sm:p-4 max-w-md mx-auto w-full min-w-0 overflow-x-hidden space-y-3.5 transition-colors">
      {/* Phone Header */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Smart Planner · by bhaleinc
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Study Scheduler
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
          Algorithmic scheduling calibrated for exam deadlines and retention pacing.
        </p>
      </div>

      {/* Action Buttons: 2 columns on Phone */}
      <div className="grid grid-cols-2 gap-2 w-full">
        <button
          onClick={() => setTaskModalOpen(true)}
          className="py-2.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-600" />
          <span>Manual Task</span>
        </button>

        <button
          onClick={handleGenerateAiPlan}
          disabled={loadingAi}
          className="py-2.5 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5"
        >
          {loadingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>AI Schedule</span>
        </button>
      </div>

      {/* AI Schedule Configuration Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-3 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">Daily Study Budget</h2>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
            {availableHours} hrs/day
          </span>
        </div>

        {/* Range slider */}
        <div className="space-y-1.5">
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={availableHours}
            onChange={(e) => setAvailableHours(parseFloat(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>1h Light</span>
            <span>4h Balanced</span>
            <span>8h Cram</span>
          </div>
        </div>

        {/* Plan Type Selector */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Optimization Objective
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'daily', label: 'Daily' },
              { id: 'weekly', label: 'Weekly' },
              { id: 'exam_prep', label: 'Exam Cram' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedPlanType(opt.id as any)}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold text-center transition-all ${
                  selectedPlanType === opt.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {aiError && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="break-words">{aiError}</span>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-3 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">Active Tasks</h2>
          </div>
          <span className="text-[11px] text-slate-400 tabular-nums">
            {tasks.filter((t) => t.completed).length} of {tasks.length} done
          </span>
        </div>

        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No tasks yet. Tap "AI Schedule" to auto-build your plan!
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 min-w-0"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-semibold leading-snug break-words ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {task.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{task.subject}</span>
                    {task.chapter && (
                      <>
                        <span>·</span>
                        <span className="truncate max-w-[120px]">{task.chapter}</span>
                      </>
                    )}
                    <span>·</span>
                    <span className="tabular-nums">{task.durationMinutes}m</span>
                    {task.scheduledTime && (
                      <>
                        <span>·</span>
                        <span>{task.scheduledTime}</span>
                      </>
                    )}
                  </div>

                  {task.notes && (
                    <p className="text-[10px] text-slate-400 mt-1 italic break-words line-clamp-2">
                      "{task.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-center">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      task.difficulty === 'Hard'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : task.difficulty === 'Medium'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {task.difficulty}
                  </span>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manual Task Add Modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-4 shadow-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Study Task</h3>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Integration by Parts"
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                  >
                    {user?.subjects?.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Chapter</label>
                  <input
                    type="text"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    placeholder="Chapter 4"
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Minutes</label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
