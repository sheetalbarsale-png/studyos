import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ASSETS } from '../../constants/assets';
import {
  Search,
  Brain,
  Sparkles,
} from 'lucide-react';

export const StudyLibraryView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const libraryItems = [
    {
      id: 'lib-1',
      title: 'Multivariable Calculus & Vector Fields Cheat Sheet',
      subject: 'Mathematics',
      type: 'Formula Sheet',
      pages: '4 pages',
      downloads: '1.2k',
      summary: 'Green’s Theorem, Stokes’ Theorem, and coordinate Jacobians.',
    },
    {
      id: 'lib-2',
      title: 'Maxwell’s Equations in Differential Form',
      subject: 'Physics',
      type: 'Guide',
      pages: '6 pages',
      downloads: '940',
      summary: 'Electrodynamics boundary conditions, Poynting vector flux, and plane waves.',
    },
    {
      id: 'lib-3',
      title: 'Organic Reaction Mechanisms: SN1, SN2, E1, E2',
      subject: 'Organic Chemistry',
      type: 'Concept Map',
      pages: '8 pages',
      downloads: '1.8k',
      summary: 'Decision matrix for substitution and elimination pathways with solvent effects.',
    },
    {
      id: 'lib-4',
      title: 'Graph Algorithms & DP Recurrences',
      subject: 'Computer Science',
      type: 'Proofs',
      pages: '5 pages',
      downloads: '2.1k',
      summary: 'Dijkstra, Bellman-Ford, A*, and Knapsack recurrences with Big-O time and space.',
    },
    {
      id: 'lib-5',
      title: 'Cellular Respiration & Krebs Cycle',
      subject: 'Biology',
      type: 'Diagram',
      pages: '3 pages',
      downloads: '810',
      summary: 'Glycolysis, Citric Acid Cycle, and Electron Transport Chain stoichiometry.',
    },
  ];

  const filtered = libraryItems.filter((item) => {
    const matchesFilter = selectedFilter === 'All' || item.subject === selectedFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-3.5 sm:p-4 max-w-md mx-auto w-full min-w-0 overflow-x-hidden space-y-3.5 transition-colors">
      {/* Phone Header */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Repository · by bhaleinc
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Study Library
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
          Vetted textbook summaries, formula sheets, and peer-reviewed reference sheets.
        </p>
      </div>

      {/* Library Editorial Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs h-36">
        <img
          src={ASSETS.libraryBanner}
          alt="Modern Study Library"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end p-3.5">
          <div className="text-white space-y-0.5 min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-300">
              Verified Collection
            </span>
            <h2 className="text-sm font-bold truncate">
              250+ Peer-Reviewed Study Guides
            </h2>
            <p className="text-[10px] text-slate-200 truncate">
              Cross-indexed with AI Tutor for live interactive questions.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search guides, formulas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
        />
      </div>

      {/* Subject Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['All', 'Mathematics', 'Physics', 'Organic Chemistry', 'Computer Science', 'Biology'].map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
              selectedFilter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Library Cards List */}
      <div className="space-y-2.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 min-w-0"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">{item.subject}</span>
              <span>{item.type} · {item.pages}</span>
            </div>

            <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug break-words">
              {item.title}
            </h3>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug break-words">
              {item.summary}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-400 tabular-nums">{item.downloads} saved</span>

              <button
                onClick={() => setActiveTab('tutor')}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1"
              >
                <Brain className="w-3 h-3" />
                <span>Explain with Tutor</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
