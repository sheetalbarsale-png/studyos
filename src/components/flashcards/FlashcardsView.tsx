import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Flashcard } from '../../types';
import { generateAiFlashcards } from '../../services/geminiClient';
import {
  Layers,
  Sparkles,
  RotateCw,
  Plus,
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  ChevronRight,
} from 'lucide-react';

export const FlashcardsView: React.FC = () => {
  const { flashcards, flashcardDecks, addFlashcards, reviewFlashcard, user } = useApp();

  const [selectedDeckId, setSelectedDeckId] = useState<string>('all');
  const [reviewModeActive, setReviewModeActive] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Generator Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [subject, setSubject] = useState(user?.subjects?.[0] || 'Physics');
  const [chapter, setChapter] = useState('');
  const [cardCount, setCardCount] = useState(6);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const filteredCards = selectedDeckId === 'all'
    ? flashcards
    : flashcards.filter((f) => f.deckId === selectedDeckId);

  const dueForReviewCards = filteredCards.filter((c) => c.leitnerBox <= 3);
  const activeReviewCards = dueForReviewCards.length > 0 ? dueForReviewCards : filteredCards;
  const currentCard = activeReviewCards[currentReviewIndex];

  const handleStartReview = () => {
    setCurrentReviewIndex(0);
    setIsFlipped(false);
    setReviewModeActive(true);
  };

  const handleReviewRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;
    reviewFlashcard(currentCard.id, rating);
    setIsFlipped(false);

    if (currentReviewIndex + 1 < activeReviewCards.length) {
      setCurrentReviewIndex(currentReviewIndex + 1);
    } else {
      setReviewModeActive(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceText.trim()) return;

    setGenerating(true);
    setGenError(null);

    try {
      const cards = await generateAiFlashcards({
        sourceText,
        subject,
        chapter,
        count: cardCount,
        difficulty,
      });

      if (cards && cards.length > 0) {
        addFlashcards(
          cards.map((c) => ({
            front: c.front,
            back: c.back,
            subject,
            chapter: chapter || 'Key Formulas',
            difficulty: c.difficulty || difficulty,
          })),
          chapter ? `${subject}: ${chapter}` : `${subject} Flashcards`
        );
        setModalOpen(false);
        setSourceText('');
        setChapter('');
      }
    } catch (err: any) {
      console.error(err);
      setGenError(err.message || 'Failed to generate flashcards.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-3.5 sm:p-4 max-w-md mx-auto w-full min-w-0 overflow-x-hidden space-y-3.5 transition-colors">
      {/* Header */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Spaced Repetition · by bhaleinc
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">AI Flashcards</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
          Leitner 5-box spaced intervals convert short-term cramming into permanent memory.
        </p>
      </div>

      {/* Action Buttons: 2 columns on Phone */}
      <div className="grid grid-cols-2 gap-2 w-full">
        <button
          onClick={handleStartReview}
          disabled={filteredCards.length === 0}
          className="py-2.5 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Review ({activeReviewCards.length})</span>
        </button>

        <button
          onClick={() => setModalOpen(true)}
          className="py-2.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI Generate</span>
        </button>
      </div>

      {/* Leitner Retention Pipeline: Compact Horizontal Slider */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-2.5 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">Leitner Stages</h2>
          </div>
          <span className="text-[11px] text-slate-400 tabular-nums">
            {flashcards.filter((f) => f.leitnerBox >= 4).length} of {flashcards.length} mastered
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {[
            { box: 1, label: '1d', color: 'border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20' },
            { box: 2, label: '2d', color: 'border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20' },
            { box: 3, label: '4d', color: 'border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20' },
            { box: 4, label: '7d', color: 'border-violet-200 dark:border-violet-900/60 bg-violet-50/50 dark:bg-violet-950/20' },
            { box: 5, label: '30d', color: 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20' },
          ].map((item) => {
            const count = flashcards.filter((f) => f.leitnerBox === item.box).length;
            return (
              <div
                key={item.box}
                className={`p-2 rounded-xl border text-center transition-all ${item.color} min-w-0`}
              >
                <p className="text-[9px] font-bold text-slate-500">Box {item.box}</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">{count}</p>
                <p className="text-[8px] text-slate-400">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Review Mode Card */}
      {reviewModeActive && currentCard ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 p-4 shadow-md space-y-3.5 min-w-0">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[150px]">
              {currentCard.subject}
            </span>
            <span className="tabular-nums">
              {currentReviewIndex + 1} / {activeReviewCards.length}
            </span>
            <button
              onClick={() => setReviewModeActive(false)}
              className="font-semibold text-rose-500 hover:text-rose-600"
            >
              Exit
            </button>
          </div>

          {/* 3D Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[190px] rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-800 dark:to-slate-850 border border-slate-200 dark:border-slate-700 p-5 flex flex-col items-center justify-center text-center transition-all"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {isFlipped ? 'Answer (Tap to flip back)' : 'Prompt (Tap to reveal answer)'}
            </span>

            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>

            <div className="mt-4 flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400">
              <RotateCw className="w-3 h-3" />
              <span>Tap to flip</span>
            </div>
          </div>

          {/* Leitner Rating Controls: 2x2 grid on Phone */}
          {isFlipped ? (
            <div className="space-y-2">
              <p className="text-center text-[11px] font-semibold text-slate-500">
                Rate your recall accuracy:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleReviewRating('again')}
                  className="py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold"
                >
                  Again (1d)
                </button>
                <button
                  onClick={() => handleReviewRating('hard')}
                  className="py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold"
                >
                  Hard (2d)
                </button>
                <button
                  onClick={() => handleReviewRating('good')}
                  className="py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold"
                >
                  Good (4d)
                </button>
                <button
                  onClick={() => handleReviewRating('easy')}
                  className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold"
                >
                  Easy (7d)
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-[11px] text-slate-400">
              Tap the card to reveal the answer before scoring your recall.
            </div>
          )}
        </div>
      ) : (
        /* Deck List Mode */
        <div className="space-y-3">
          {/* Deck selector chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedDeckId('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${
                selectedDeckId === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              All ({flashcards.length})
            </button>
            {flashcardDecks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => setSelectedDeckId(deck.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${
                  selectedDeckId === deck.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {deck.title}
              </button>
            ))}
          </div>

          {/* Cards List */}
          <div className="space-y-2">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5 min-w-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                    {card.subject}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    Box {card.leitnerBox}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug break-words">
                  {card.front}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug break-words border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                  {card.back}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generator Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-4 shadow-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Flashcard Generator</h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Topic, Chapter or Concept
                </label>
                <textarea
                  required
                  rows={3}
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="e.g. Electromagnetic induction, Faraday's Law, Lenz's Law..."
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
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
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Card Count</label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={cardCount}
                    onChange={(e) => setCardCount(parseInt(e.target.value, 10))}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                  />
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
                  <span>Generate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
