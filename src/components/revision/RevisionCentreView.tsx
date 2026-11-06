import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const RevisionCentreView: React.FC = () => {
  const { revisionItems, resolveRevisionItem, setActiveTab, flashcards } = useApp();

  const highUrgency = revisionItems.filter((r) => r.urgency === 'high');
  const dueFlashcards = flashcards.filter((f) => f.leitnerBox <= 2);

  return (
    <div className="p-3.5 sm:p-4 max-w-md mx-auto w-full min-w-0 overflow-x-hidden space-y-3.5 transition-colors">
      {/* Phone Header */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
          Spaced Recall Engine · by bhaleinc
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Revision Centre
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
          Identifies conceptual gaps from diagnostic tests to schedule high-yield recall intervals.
        </p>
      </div>

      {/* Priority Weak Topic Alert Banner */}
      {highUrgency.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2 min-w-0">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 rounded-lg shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                {highUrgency.length} Concepts Need Urgent Review
              </h2>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5 leading-snug break-words">
                Diagnostic test gaps: {highUrgency.map((h) => h.topic).join(', ')}.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('tutor')}
            className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Review with AI Tutor</span>
          </button>
        </div>
      )}

      {/* Active Revision Roadmap */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-3 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">Active Revision Roadmap</h2>
          </div>
          <span className="text-[11px] text-slate-400">{revisionItems.length} items</span>
        </div>

        <div className="space-y-2">
          {revisionItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              All concepts mastered! Take a practice test to discover new areas to refine.
            </div>
          ) : (
            revisionItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 min-w-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white break-words">
                      {item.topic}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{item.subject}</span>
                      <span>·</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        {item.confidenceScore}% confidence
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      item.urgency === 'high'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {item.urgency === 'high' ? 'High' : 'Interval'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setActiveTab('tutor')}
                    className="py-1 px-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold text-center"
                  >
                    Ask Tutor
                  </button>
                  <button
                    onClick={() => resolveRevisionItem(item.id)}
                    className="py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Mastered</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Leitner Spaced Cards Due */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-2.5 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Cards Due for Recall</span>
          </h3>
          <span className="text-xs font-bold text-indigo-600 tabular-nums">{dueFlashcards.length}</span>
        </div>

        <p className="text-[11px] text-slate-500 leading-snug">
          Box 1 & 2 flashcards require active reinforcement to halt retention decay.
        </p>

        <button
          onClick={() => setActiveTab('flashcards')}
          className="w-full py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
        >
          <span>Open Due Flashcards</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Ebbinghaus Forgetting Curve Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-900 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5 text-xs min-w-0">
        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Ebbinghaus Retention Science</span>
        </h4>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] break-words">
          Without spaced review, students lose ~70% of new information within 48 hours. By testing recall across exponential intervals (Day 1, 3, 7, 14), retention stabilizes above 90%.
        </p>
      </div>
    </div>
  );
};
