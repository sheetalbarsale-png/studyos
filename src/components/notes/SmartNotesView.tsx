import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SmartNote } from '../../types';
import { generateSmartNotes, extractTextFromImage } from '../../services/geminiClient';
import {
  FileText,
  Plus,
  Sparkles,
  Search,
  Upload,
  Copy,
  Download,
  Trash2,
  Check,
  Loader2,
  ChevronLeft,
  X,
} from 'lucide-react';

export const SmartNotesView: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, user } = useApp();

  const [selectedNote, setSelectedNote] = useState<SmartNote | null>(notes[0] || null);
  const [activePane, setActivePane] = useState<'list' | 'detail'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // AI Generator Modal
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiSubject, setAiSubject] = useState(user?.subjects?.[0] || 'Mathematics');
  const [aiChapter, setAiChapter] = useState('');
  const [aiMode, setAiMode] = useState<'short' | 'detailed' | 'exam' | 'definitions' | 'formulas' | 'summary'>('detailed');
  const [uploadedImage, setUploadedImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  // Copy indicator
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredNotes = notes.filter((n) => {
    const matchesSubject = selectedSubjectFilter === 'All' || n.subject === selectedSubjectFilter;
    const matchesQuery =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesQuery;
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setUploadedImage({
        base64,
        mimeType: file.type,
        preview: URL.createObjectURL(file),
      });

      try {
        const text = await extractTextFromImage(base64, file.type);
        if (text) {
          setAiTopic((prev) => (prev ? `${prev}\n\n${text}` : text));
        }
      } catch (err) {
        console.error('OCR failed', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim() && !uploadedImage) return;

    setGenerating(true);
    setGeneratorError(null);

    try {
      const markdown = await generateSmartNotes({
        topicOrText: aiTopic,
        subject: aiSubject,
        chapter: aiChapter || 'Core Principles',
        mode: aiMode,
        imageBase64: uploadedImage?.base64,
        mimeType: uploadedImage?.mimeType,
      });

      const newNote = addNote({
        title: aiChapter ? `${aiSubject}: ${aiChapter}` : `${aiSubject}: ${aiTopic.slice(0, 25)}`,
        subject: aiSubject,
        chapter: aiChapter || 'General',
        mode: aiMode,
        content: markdown,
        tags: [aiSubject, aiMode, 'AI Synthesis'],
      });

      setSelectedNote(newNote);
      setActivePane('detail');
      setGeneratorModalOpen(false);
      setAiTopic('');
      setAiChapter('');
      setUploadedImage(null);
    } catch (err: any) {
      console.error(err);
      setGeneratorError(err.message || 'Failed to generate smart notes.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateEmptyNote = () => {
    const newNote = addNote({
      title: 'Untitled Note',
      subject: user?.subjects?.[0] || 'General',
      chapter: 'Draft',
      mode: 'detailed',
      content: `# Untitled Study Note\n\nWrite your concepts, definitions, and equations here...`,
      tags: ['Manual Notes'],
    });
    setSelectedNote(newNote);
    setActivePane('detail');
  };

  const handleDownloadMarkdown = () => {
    if (!selectedNote) return;
    const blob = new Blob([selectedNote.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedNote.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    if (!selectedNote) return;
    navigator.clipboard.writeText(selectedNote.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-3.5 sm:p-4 max-w-md mx-auto w-full min-w-0 overflow-x-hidden space-y-3.5 transition-colors">
      {/* Phone Header & Actions */}
      {activePane === 'list' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Notes Engine · by bhaleinc
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Smart Notes</h1>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCreateEmptyNote}
                className="p-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                title="Create blank note"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGeneratorModalOpen(true)}
                className="py-1.5 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Note</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes, formulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          {/* Subject Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedSubjectFilter('All')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                selectedSubjectFilter === 'All'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              All ({notes.length})
            </button>
            {user?.subjects?.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubjectFilter(sub)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  selectedSubjectFilter === sub
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Notes List Cards */}
          <div className="space-y-2">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-slate-400 text-xs">
                No notes found. Tap "AI Note" to synthesize notes from textbook chapters.
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNote(note);
                    setActivePane('detail');
                  }}
                  className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer shadow-xs min-w-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate flex-1">
                      {note.title}
                    </p>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                      {note.mode}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-snug break-words">
                    {note.content.replace(/#|\*|_/g, '').slice(0, 100)}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{note.subject}</span>
                    <span>{new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* DETAIL / EDITOR MODE ON PHONE */
        <div className="space-y-3 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setActivePane('list')}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 p-1 -ml-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>All Notes</span>
            </button>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleCopyMarkdown}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                title="Copy markdown"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                title="Export"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              {selectedNote && (
                <button
                  onClick={() => {
                    deleteNote(selectedNote.id);
                    setSelectedNote(null);
                    setActivePane('list');
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {selectedNote && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-3 min-w-0">
              <div>
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => {
                    updateNote(selectedNote.id, { title: e.target.value });
                    setSelectedNote({ ...selectedNote, title: e.target.value });
                  }}
                  className="text-sm font-bold text-slate-900 dark:text-white bg-transparent border-0 focus:outline-none w-full"
                />
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedNote.subject}</span>
                  <span>·</span>
                  <span>{selectedNote.chapter}</span>
                  <span>·</span>
                  <span className="capitalize">{selectedNote.mode}</span>
                </div>
              </div>

              <textarea
                value={selectedNote.content}
                onChange={(e) => {
                  updateNote(selectedNote.id, { content: e.target.value });
                  setSelectedNote({ ...selectedNote, content: e.target.value });
                }}
                rows={16}
                className="w-full bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none leading-relaxed resize-none border border-slate-100 dark:border-slate-800"
              />
            </div>
          )}
        </div>
      )}

      {/* AI Synthesis Modal */}
      {generatorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-4 shadow-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Synthesize Smart Notes</h3>
              </div>
              <button onClick={() => setGeneratorModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleGenerateNotes} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Concept Topic or Textbook Excerpt
                </label>
                <textarea
                  required
                  rows={3}
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Thermodynamics Carnot Cycle, entropy, and second law..."
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Subject</label>
                  <select
                    value={aiSubject}
                    onChange={(e) => setAiSubject(e.target.value)}
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
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Format</label>
                  <select
                    value={aiMode}
                    onChange={(e) => setAiMode(e.target.value as any)}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="detailed">Detailed Notes</option>
                    <option value="short">Short Bullet Notes</option>
                    <option value="exam">Exam Cram Sheet</option>
                    <option value="formulas">Formula Sheet</option>
                    <option value="definitions">Key Definitions</option>
                  </select>
                </div>
              </div>

              {/* Textbook Photo / OCR upload */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 border border-dashed border-indigo-200 dark:border-indigo-900 rounded-xl text-xs text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1.5 bg-indigo-50/50 dark:bg-indigo-950/20"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadedImage ? 'Photo Attached (OCR Applied)' : 'Snap / Upload Textbook Page'}</span>
                </button>
              </div>

              {generatorError && (
                <div className="text-[11px] text-rose-600 p-2 bg-rose-50 dark:bg-rose-950/50 rounded-lg">
                  {generatorError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setGeneratorModalOpen(false)}
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
                  <span>Generate Notes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
