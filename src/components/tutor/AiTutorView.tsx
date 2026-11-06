import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LearningMode, Subject, ChatMessage } from '../../types';
import { askAiTutor } from '../../services/geminiClient';
import {
  Brain,
  Send,
  Upload,
  Image as ImageIcon,
  Sparkles,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Copy,
  PlusCircle,
  RotateCcw,
  AlertCircle,
  Loader2,
  X,
  FileText,
} from 'lucide-react';

export const AiTutorView: React.FC = () => {
  const { user, awardXp, addNote, addFlashcards, setActiveTab } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello ${user?.name || 'Student'}! I'm your STUDYOS AI Tutor.

I'm here to guide you so you don't just memorize formulas or facts—you **understand, remember, and master** them.

Ask me any academic question, paste an exam problem, or upload a photograph of your textbook or handwritten notes. Which topic would you like to explore today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        'Explain Gauss’s Law conceptually with intuitive analogies',
        'Help me solve this calculus integral: ∫ x · e^(2x) dx',
        'What is the difference between SN1 and SN2 reaction kinetics?',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<LearningMode>('conceptual');
  const [selectedSubject, setSelectedSubject] = useState<Subject>(
    (user?.subjects?.[0] as Subject) || 'Mathematics'
  );
  const [uploadedImage, setUploadedImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [noteCreatedId, setNoteCreatedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const learningModes: { id: LearningMode; label: string; desc: string }[] = [
    { id: 'conceptual', label: 'Conceptual', desc: 'Focus on intuition, mental models & "why"' },
    { id: 'step_by_step', label: 'Step-by-Step', desc: 'Detailed derivation, mechanics & formulas' },
    { id: 'exam_prep', label: 'Exam Prep', desc: 'High-yield points, marking scheme & pitfalls' },
    { id: 'simple', label: 'Simple', desc: 'Concise, clear, zero fluff' },
    { id: 'eli10', label: 'Explain Like I’m 10', desc: 'Friendly analogies & relatable metaphors' },
    { id: 'detailed', label: 'Detailed Academic', desc: 'In-depth rigorous university-level depth' },
    { id: 'real_world', label: 'Real-World', desc: 'Everyday applications & technological cases' },
  ];

  const subjects: Subject[] = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'English',
    'History',
    'Geography',
    'Economics',
    'Languages',
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedImage({
        base64,
        mimeType: file.type,
        preview: URL.createObjectURL(file),
      });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (overridePrompt?: string) => {
    const textToSend = overridePrompt || input;
    if ((!textToSend.trim() && !uploadedImage) || loading) return;

    setError(null);
    const userMessageId = `msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: selectedMode,
      subject: selectedSubject,
      imageUrl: uploadedImage?.preview,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    const imageToSend = uploadedImage ? uploadedImage.base64 : undefined;
    const mimeToSend = uploadedImage ? uploadedImage.mimeType : undefined;
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setLoading(true);

    try {
      const historyForApi = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await askAiTutor({
        message: textToSend,
        mode: selectedMode,
        subject: selectedSubject,
        imageBase64: imageToSend,
        mimeType: mimeToSend,
        conversationHistory: historyForApi,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-tutor-${Date.now()}`,
        role: 'assistant',
        content: res.text || 'I analyzed your question. Let me know if you would like to explore deeper!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: res.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      awardXp(20, 'Tutor session interaction');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to reach AI Tutor. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveAsNote = (content: string, id: string) => {
    addNote({
      title: `${selectedSubject}: Note on ${content.slice(0, 35)}...`,
      subject: selectedSubject,
      chapter: 'AI Tutor Insights',
      mode: 'detailed',
      content,
      tags: [selectedSubject, 'AI Tutor', selectedMode],
    });
    setNoteCreatedId(id);
    setTimeout(() => setNoteCreatedId(null), 2500);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Top Controls Toolbar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Subject Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Subject:
            </span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as Subject)}
              className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Learning Mode Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {learningModes.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                title={m.desc}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedMode === m.id
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-500/20 mt-1">
                    <Brain className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`min-w-0 max-w-[88%] sm:max-w-xl rounded-2xl p-3.5 transition-all break-words overflow-hidden ${
                    isUser
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm'
                  }`}
                >
                  {/* Meta Bar */}
                  <div className="flex items-center justify-between gap-2 text-[10px] mb-1.5 opacity-75">
                    <span className="font-semibold truncate">
                      {isUser ? user?.name || 'You' : 'STUDYOS AI Tutor'}
                    </span>
                    <span className="shrink-0">{msg.timestamp}</span>
                  </div>

                  {/* Uploaded Image preview in user bubble */}
                  {msg.imageUrl && (
                    <div className="mb-3 rounded-lg overflow-hidden border border-white/20 max-w-sm">
                      <img
                        src={msg.imageUrl}
                        alt="Uploaded student reference"
                        className="w-full max-h-48 object-contain bg-black/20"
                      />
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="prose dark:prose-invert prose-xs max-w-none break-words leading-relaxed space-y-2 whitespace-pre-wrap font-sans overflow-x-auto">
                    {msg.content}
                  </div>

                  {/* Action Bar for Assistant Messages */}
                  {!isUser && msg.id !== 'welcome-msg' && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedId === msg.id ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <span>·</span>
                        <button
                          onClick={() => handleSaveAsNote(msg.content, msg.id)}
                          className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{noteCreatedId === msg.id ? 'Saved to Notes!' : 'Save to Notes'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Suggested Follow-Ups */}
                  {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Explore further
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(prompt)}
                            disabled={loading}
                            className="text-left text-xs bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 transition-colors"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3.5 justify-start">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 animate-pulse">
                <Brain className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Formulating pedagogical explanation in {selectedMode} mode...
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Composer */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Uploaded Image Thumbnail Preview */}
          {uploadedImage && (
            <div className="flex items-center gap-3 p-2 bg-indigo-50/70 dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-slate-700 w-fit">
              <img
                src={uploadedImage.preview}
                alt="Upload preview"
                className="w-12 h-12 object-cover rounded-md border border-slate-200 dark:border-slate-700"
              />
              <div className="text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Textbook / Note Attached</p>
                <p className="text-slate-500 dark:text-slate-400">Ready for AI optical analysis</p>
              </div>
              <button
                onClick={removeUploadedImage}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
            {/* Hidden File Input for textbook photos */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload textbook photo or handwritten notes"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-xl transition-colors"
            >
              <Upload className="w-5 h-5" />
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask a question in ${selectedSubject}... (e.g. "Explain the derivation of Snell's Law")`}
              rows={2}
              className="flex-1 bg-transparent border-0 focus:outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none py-1.5"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={(!input.trim() && !uploadedImage) || loading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1">
            <span>Mode: {learningModes.find((m) => m.id === selectedMode)?.label}</span>
            <span>Press Enter to send, Shift+Enter for newline</span>
          </div>
        </div>
      </div>
    </div>
  );
};
