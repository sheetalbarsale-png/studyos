import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PracticeTest, PracticeQuestion, TestAttempt } from '../../types';
import { generatePracticeTest } from '../../services/geminiClient';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Play,
  RotateCcw,
  Check,
  X,
  Loader2,
  ArrowRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

export const PracticeTestsView: React.FC = () => {
  const { practiceTests, addPracticeTest, testAttempts, saveTestAttempt, user, awardXp } = useApp();

  // Test Generator Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [subject, setSubject] = useState(user?.subjects?.[0] || 'Mathematics');
  const [chapter, setChapter] = useState('');
  const [questionCount, setQuestionCount] = useState(4);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['mcq', 'short_answer']);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Active Test-Taking State
  const [activeTest, setActiveTest] = useState<PracticeTest | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<TestAttempt | null>(null);

  // Countdown timer for active test
  useEffect(() => {
    if (!activeTest || testCompleted) return;
    if (secondsRemaining <= 0) {
      handleSubmitTest();
      return;
    }
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTest, testCompleted, secondsRemaining]);

  const handleStartTest = (test: PracticeTest) => {
    setActiveTest(test);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setSecondsRemaining(test.timeLimitMinutes * 60);
    setTestCompleted(false);
    setLastAttempt(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setGenError(null);

    try {
      const generated = await generatePracticeTest({
        subject,
        chapter: chapter || 'Diagnostic Exam',
        questionCount,
        difficulty,
        questionTypes: selectedTypes,
      });

      if (generated && generated.questions && generated.questions.length > 0) {
        const newTest: PracticeTest = {
          id: `test-${Date.now()}`,
          title: generated.title || `${subject}: ${chapter || 'Diagnostic Assessment'}`,
          subject,
          chapter: chapter || 'General',
          difficulty,
          timeLimitMinutes: generated.timeLimitMinutes || Math.max(5, questionCount * 3),
          questions: generated.questions,
          createdAt: new Date().toISOString().split('T')[0],
        };

        addPracticeTest(newTest);
        setModalOpen(false);
        handleStartTest(newTest);
      }
    } catch (err: any) {
      console.error(err);
      setGenError(err.message || 'Failed to generate practice test.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitTest = () => {
    if (!activeTest) return;

    let score = 0;
    let totalMarks = 0;
    const weakTopicsSet = new Set<string>();
    const topicStats: Record<string, { correct: number; total: number }> = {};

    activeTest.questions.forEach((q) => {
      totalMarks += q.marks;
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { correct: 0, total: 0 };
      }
      topicStats[q.topic].total += 1;

      const userAns = (userAnswers[q.id] || '').trim().toLowerCase();
      const correctAns = q.correctAnswer.trim().toLowerCase();

      const isCorrect =
        q.type === 'mcq' || q.type === 'true_false'
          ? userAns === correctAns
          : userAns.length > 0 && (userAns === correctAns || correctAns.includes(userAns) || userAns.includes(correctAns));

      if (isCorrect) {
        score += q.marks;
        topicStats[q.topic].correct += 1;
      } else {
        weakTopicsSet.add(q.topic);
      }
    });

    const percentage = Math.round((score / totalMarks) * 100);
    const timeSpent = activeTest.timeLimitMinutes * 60 - Math.max(0, secondsRemaining);

    const topicBreakdown = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      correct: stats.correct,
      total: stats.total,
    }));

    const attempt: Omit<TestAttempt, 'id'> = {
      testId: activeTest.id,
      testTitle: activeTest.title,
      subject: activeTest.subject,
      date: new Date().toISOString().split('T')[0],
      score,
      totalMarks,
      percentage,
      timeSpentSeconds: timeSpent,
      userAnswers,
      topicBreakdown,
      weakTopics: Array.from(weakTopicsSet),
      recommendedRevision: Array.from(weakTopicsSet).map((w) => `Re-read foundational derivations in ${w}`),
    };

    saveTestAttempt(attempt);
    setLastAttempt({ ...attempt, id: `att-${Date.now()}` });
    setTestCompleted(true);

    if (percentage >= 70) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch (e) {
        // confetti fallback
      }
      awardXp(60);
    } else {
      awardXp(25);
    }
  };

  const currentQ = activeTest?.questions[currentQuestionIdx];

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="p-3.5 sm:p-4 max-w-md mx-auto w-full min-w-0 overflow-x-hidden space-y-3.5 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Assessment Engine · by bhaleinc
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">
            Practice Tests
          </h1>
        </div>

        {!activeTest && (
          <button
            onClick={() => setModalOpen(true)}
            className="py-1.5 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center gap-1 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Test</span>
          </button>
        )}
      </div>

      {/* ACTIVE TEST TAKING INTERFACE */}
      {activeTest && !testCompleted && currentQ && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 p-4 shadow-md space-y-3.5 min-w-0">
          {/* Test Meta Header with Timer */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider truncate">
                {activeTest.subject} · {activeTest.difficulty}
              </p>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white truncate">{activeTest.title}</h2>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold tabular-nums shrink-0">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          </div>

          {/* Question Nav Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {activeTest.questions.map((q, idx) => {
              const isAnswered = Boolean(userAnswers[q.id]);
              const isCurrent = idx === currentQuestionIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isAnswered
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Question Body */}
          <div className="space-y-3 min-w-0">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Q{currentQuestionIdx + 1} of {activeTest.questions.length}</span>
              <span>{currentQ.marks} {currentQ.marks === 1 ? 'mark' : 'marks'}</span>
            </div>

            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug break-words">
              {currentQ.question}
            </p>

            {/* MCQ Options */}
            {currentQ.type === 'mcq' && currentQ.options && (
              <div className="space-y-2">
                {currentQ.options.map((opt, i) => {
                  const isSelected = userAnswers[currentQ.id] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => setUserAnswers({ ...userAnswers, [currentQ.id]: opt })}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 text-xs ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0 font-bold">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="break-words flex-1 leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* True / False */}
            {currentQ.type === 'true_false' && (
              <div className="grid grid-cols-2 gap-2">
                {['True', 'False'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setUserAnswers({ ...userAnswers, [currentQ.id]: tf })}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                      userAnswers[currentQ.id] === tf
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            )}

            {/* Short Answer */}
            {currentQ.type === 'short_answer' && (
              <div>
                <input
                  type="text"
                  placeholder="Type your concise mathematical or conceptual answer..."
                  value={userAnswers[currentQ.id] || ''}
                  onChange={(e) => setUserAnswers({ ...userAnswers, [currentQ.id]: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Navigation & Submit Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
              disabled={currentQuestionIdx === 0}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 disabled:opacity-30"
            >
              Previous
            </button>

            {currentQuestionIdx + 1 < activeTest.questions.length ? (
              <button
                onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Next Q
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Submit Exam
              </button>
            )}
          </div>
        </div>
      )}

      {/* POST-TEST RESULTS SCREEN */}
      {testCompleted && lastAttempt && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3.5 min-w-0">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center mx-auto">
              <FileCheck className="w-6 h-6" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Exam Completed</h2>
            <p className="text-xs text-slate-500">Diagnostic performance summary</p>
          </div>

          {/* Score Card */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900">
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Score</p>
              <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                {lastAttempt.percentage}%
              </p>
              <p className="text-[10px] text-slate-400">{lastAttempt.score} / {lastAttempt.totalMarks} marks</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Time Spent</p>
              <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                {formatTimer(lastAttempt.timeSpentSeconds)}
              </p>
              <p className="text-[10px] text-slate-400">Duration</p>
            </div>
          </div>

          {/* Weak Topics to Revise */}
          {lastAttempt.weakTopics.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1.5">
              <p className="text-[11px] font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Identified Concepts for Revision:</span>
              </p>
              <ul className="text-xs text-rose-700 dark:text-rose-400 space-y-1 pl-4 list-disc">
                {lastAttempt.weakTopics.map((w, idx) => (
                  <li key={idx} className="break-words">{w}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => {
              setActiveTest(null);
              setTestCompleted(false);
            }}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Back to Tests Catalog
          </button>
        </div>
      )}

      {/* Available Tests List (when not in test) */}
      {!activeTest && !testCompleted && (
        <div className="space-y-2">
          {practiceTests.map((t) => (
            <div
              key={t.id}
              className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 min-w-0"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">{t.subject}</span>
                  <span>·</span>
                  <span>{t.timeLimitMinutes}m limit</span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                  {t.title}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {t.questions.length} questions · {t.difficulty}
                </p>
              </div>

              <button
                onClick={() => handleStartTest(t)}
                className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Start</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Test Generator Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-4 shadow-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Practice Test</h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                >
                  {user?.subjects?.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Chapter or Topic</label>
                <input
                  type="text"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="e.g. Electromagnetism & Induction"
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Questions</label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
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

              {genError && (
                <div className="text-[11px] text-rose-600 p-2 bg-rose-50 dark:bg-rose-950/50 rounded-lg">
                  {genError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Generate Test</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
