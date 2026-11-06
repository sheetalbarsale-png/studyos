import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Plus,
  Calendar,
  Layers,
  FileText,
  Brain,
  ArrowRight,
  X,
} from 'lucide-react';

export const SubjectsView: React.FC = () => {
  const { user, updateProfile, notes, flashcards, tasks, setActiveTab } = useApp();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newExamName, setNewExamName] = useState('');
  const [newExamDate, setNewExamDate] = useState('2026-11-20');

  const subjects = user?.subjects || ['Mathematics', 'Physics', 'Organic Chemistry', 'Computer Science'];

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const updatedSubjects = Array.from(new Set([...subjects, newSubjectName.trim()]));
    let updatedExams = user?.examinationDates || [];

    if (newExamName.trim() && newExamDate) {
      updatedExams = [
        ...updatedExams,
        {
          subject: newSubjectName.trim(),
          name: newExamName.trim(),
          date: newExamDate,
        },
      ];
    }

    updateProfile({ subjects: updatedSubjects, examinationDates: updatedExams });
    setNewSubjectName('');
    setNewExamName('');
    setAddModalOpen(false);
  };

  return (
    <div className="p-3.5 sm:p-4 max-w-md mx-auto w-full min-w-0 overflow-x-hidden space-y-3.5 transition-colors">
      {/* Phone Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Curriculum · by bhaleinc
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">
            My Subjects
          </h1>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="py-1.5 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Subjects Cards Stack */}
      <div className="space-y-3">
        {subjects.map((sub, i) => {
          const subjectNotes = notes.filter((n) => n.subject === sub);
          const subjectCards = flashcards.filter((f) => f.subject === sub);
          const subjectTasks = tasks.filter((t) => t.subject === sub);
          const subjectExam = user?.examinationDates?.find((e) => e.subject === sub);

          const progress = [78, 65, 84, 91, 72, 80][i % 6];

          return (
            <div
              key={sub}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-3 min-w-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xs font-bold text-slate-900 dark:text-white truncate">{sub}</h2>
                    {subjectExam && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate mt-0.5">
                        <Calendar className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="truncate">{subjectExam.name} ({subjectExam.date})</span>
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tabular-nums shrink-0">
                  {progress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Stats Pill Row: 3 columns with small gap */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-200 tabular-nums text-xs">{subjectNotes.length}</p>
                  <p className="text-[9px] text-slate-400">Notes</p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-200 tabular-nums text-xs">{subjectCards.length}</p>
                  <p className="text-[9px] text-slate-400">Cards</p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-200 tabular-nums text-xs">{subjectTasks.length}</p>
                  <p className="text-[9px] text-slate-400">Tasks</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => setActiveTab('tutor')}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Ask Tutor</span>
                </button>
                <button
                  onClick={() => setActiveTab('practice')}
                  className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                >
                  <span>Test Prep</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subject Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-4 shadow-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Subject</h3>
              <button onClick={() => setAddModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Subject Name</label>
                <input
                  type="text"
                  required
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Molecular Genetics"
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Target Exam (Optional)</label>
                <input
                  type="text"
                  value={newExamName}
                  onChange={(e) => setNewExamName(e.target.value)}
                  placeholder="Midterm Exam"
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Exam Date</label>
                <input
                  type="date"
                  value={newExamDate}
                  onChange={(e) => setNewExamDate(e.target.value)}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
