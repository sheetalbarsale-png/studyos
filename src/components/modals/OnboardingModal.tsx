import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  Target,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OnboardingModal: React.FC = () => {
  const { onboardingOpen, setOnboardingOpen, user, updateProfile } = useApp();

  const [step, setStep] = useState(1);
  const [educationLevel, setEducationLevel] = useState<'Middle School' | 'High School' | 'College/University' | 'Competitive Exam Aspirant'>('College/University');
  const [institution, setInstitution] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Mathematics',
    'Physics',
    'Organic Chemistry',
  ]);
  const [goal, setGoal] = useState('Master core STEM concepts & score >90%');
  const [studyHours, setStudyHours] = useState(3.5);
  const [examName, setExamName] = useState('Upcoming Term Examination');
  const [examDate, setExamDate] = useState('2026-11-20');

  if (!onboardingOpen) return null;

  const subjectOptions = [
    'Mathematics',
    'Physics',
    'Organic Chemistry',
    'Biology',
    'Computer Science',
    'English',
    'History',
    'Geography',
    'Economics',
    'Languages',
  ];

  const toggleSubject = (s: string) => {
    if (selectedSubjects.includes(s)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((x) => x !== s));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, s]);
    }
  };

  const handleFinish = () => {
    updateProfile({
      educationLevel,
      institution: institution.trim() || 'Academic Faculty',
      subjects: selectedSubjects,
      learningGoals: [goal],
      examinationDates: [{ subject: selectedSubjects[0] || 'General', name: examName, date: examDate }],
      preferredStudyHoursPerDay: studyHours,
      onboarded: true,
    });
    setOnboardingOpen(false);
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-3">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[88vh] overflow-y-auto min-w-0">
        {/* Progress Step Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="min-w-0">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Personalized Setup · bhaleinc
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {step === 1 ? 'Academic Level' : step === 2 ? 'Select Subjects' : 'Goals & Pacing'}
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400 tabular-nums shrink-0">
            {step} / 3
          </span>
        </div>

        {/* Step 1: Education Level & School */}
        {step === 1 && (
          <div className="space-y-3.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Your Current Level</label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {[
                  'Middle School',
                  'High School',
                  'College/University',
                  'Competitive Aspirant',
                ].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEducationLevel(lvl as any)}
                    className={`p-2.5 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                      educationLevel === lvl
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-600'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">School or Institution (Optional)</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Stanford University or Delhi Public School"
                className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Continue to Subjects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Step 2: Subjects Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Choose the subjects you study ({selectedSubjects.length} selected)
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {subjectOptions.map((sub) => {
                  const isSelected = selectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleSubject(sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Continue to Goals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Goals, Rhythm & Exam Date */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Primary Academic Goal</label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Master Calculus & pass exams with distinction"
                className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Next Major Exam</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex justify-between">
                <span>Daily Target Study Rhythm</span>
                <span className="font-bold text-indigo-600">{studyHours} hrs/day</span>
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={studyHours}
                onChange={(e) => setStudyHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 mt-2"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Launch STUDYOS App</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
