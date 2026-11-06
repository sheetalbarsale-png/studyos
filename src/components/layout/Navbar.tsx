import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sun, Moon, Sparkles, BookOpen, User, Menu, X, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onOpenDashboard?: () => void;
  isLandingPage?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isLandingPage = false }) => {
  const {
    user,
    isAuthenticated,
    isDarkMode,
    toggleDarkMode,
    setActiveTab,
    setAuthModalOpen,
    setAuthMode,
    setSubscriptionModalOpen,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
              STUDY<span className="text-indigo-600 dark:text-indigo-400">OS</span>
            </span>
          </button>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => {
              setActiveTab('overview');
            }}
            className="hover:text-indigo-600 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab('tutor');
            }}
            className="hover:text-indigo-600 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            AI Tutor
          </button>
          <button
            onClick={() => {
              setActiveTab('planner');
            }}
            className="hover:text-indigo-600 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Study Planner
          </button>
          <button
            onClick={() => {
              setActiveTab('practice');
            }}
            className="hover:text-indigo-600 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Practice Tests
          </button>
          <button
            onClick={() => {
              setSubscriptionModalOpen(true);
            }}
            className="hover:text-indigo-600 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Pricing
          </button>
        </nav>

        {/* Zone 3: 1 primary action & utility controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <img
                  src={user.avatarUrl || '/src/assets/images/avatar_student_sarah_1793957070719.jpg'}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                  {user.name}
                </span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setAuthModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-sm shadow-indigo-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <button
            onClick={() => {
              setActiveTab('overview');
              setMobileMenuOpen(false);
            }}
            className="text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab('tutor');
              setMobileMenuOpen(false);
            }}
            className="text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            AI Tutor
          </button>
          <button
            onClick={() => {
              setActiveTab('planner');
              setMobileMenuOpen(false);
            }}
            className="text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Study Planner
          </button>
          <button
            onClick={() => {
              setActiveTab('notes');
              setMobileMenuOpen(false);
            }}
            className="text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Smart Notes
          </button>
          <button
            onClick={() => {
              setActiveTab('flashcards');
              setMobileMenuOpen(false);
            }}
            className="text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            AI Flashcards
          </button>
          <button
            onClick={() => {
              setActiveTab('practice');
              setMobileMenuOpen(false);
            }}
            className="text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Practice Tests
          </button>
          <button
            onClick={() => {
              setActiveTab('revision');
              setMobileMenuOpen(false);
            }}
            className="text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Revision Centre
          </button>
          <button
            onClick={() => {
              setSubscriptionModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className="text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Pricing & Plans
          </button>
        </div>
      )}
    </header>
  );
};
