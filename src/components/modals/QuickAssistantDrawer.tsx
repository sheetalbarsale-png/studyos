import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { askAiTutor } from '../../services/geminiClient';
import {
  Sparkles,
  X,
  Send,
  Brain,
  Calendar,
  Layers,
  CheckCircle2,
  FileText,
  RotateCcw,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export const QuickAssistantDrawer: React.FC = () => {
  const {
    quickAssistantOpen,
    setQuickAssistantOpen,
    user,
    tasks,
    revisionItems,
    setActiveTab,
    awardXp,
  } = useApp();

  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!quickAssistantOpen) return null;

  const quickPrompts = [
    { label: 'Prepare my study plan for tomorrow', icon: Calendar, targetTab: 'planner' },
    { label: 'Which chapters should I revise before my exam?', icon: RotateCcw, targetTab: 'revision' },
    { label: 'Explain photosynthesis in simple language', icon: Brain, targetTab: 'tutor' },
    { label: 'Make flashcards from my biology notes', icon: Layers, targetTab: 'flashcards' },
    { label: 'Generate difficult calculus practice test', icon: CheckCircle2, targetTab: 'practice' },
  ];

  const handleExecutePrompt = async (text: string) => {
    setPrompt(text);
    setLoading(true);
    setResponse(null);

    try {
      const studentContext = `Student Profile: ${user?.name}, Level: ${user?.educationLevel}, Subjects: ${user?.subjects?.join(', ')}, Goals: ${user?.learningGoals?.join(', ')}.`;
      const res = await askAiTutor({
        message: `${text}\n\nStudent Context: ${studentContext}`,
        mode: 'conceptual',
        subject: user?.subjects?.[0] || 'General',
      });
      setResponse(res.text || 'I analyzed your request and updated your context.');
      awardXp(15, 'AI Assistant query');
    } catch (err: any) {
      setResponse(err.message || 'Failed to query assistant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                STUDYOS · bhaleinc
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">AI Assistant</h2>
            </div>
          </div>
          <button onClick={() => setQuickAssistantOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Context Prompt Pills */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Contextual One-Click Actions
          </p>
          <div className="flex flex-col gap-1.5">
            {quickPrompts.map((qp, i) => {
              const Icon = qp.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleExecutePrompt(qp.label)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs text-slate-700 dark:text-slate-200 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>{qp.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Input */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleExecutePrompt(prompt);
            }}
            placeholder="Ask anything about your syllabus, exams, or goals..."
            className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none px-2"
          />
          <button
            onClick={() => handleExecutePrompt(prompt)}
            disabled={!prompt.trim() || loading}
            className="p-2 rounded-lg bg-indigo-600 text-white disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Assistant Response Box */}
        {loading && (
          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 flex items-center gap-3 text-xs text-indigo-700 dark:text-indigo-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing student curriculum & crafting response...</span>
          </div>
        )}

        {response && !loading && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 space-y-3 shadow-sm">
            <p className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Brain className="w-4 h-4" />
              <span>AI Study OS Analysis</span>
            </p>
            <div className="prose dark:prose-invert prose-xs max-w-none leading-relaxed whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
