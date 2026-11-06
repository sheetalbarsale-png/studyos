import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MobileStatusBar } from './MobileStatusBar';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileModulesSheet } from './MobileModulesSheet';
import { OverviewView } from '../dashboard/OverviewView';
import { AiTutorView } from '../tutor/AiTutorView';
import { StudyPlannerView } from '../planner/StudyPlannerView';
import { SmartNotesView } from '../notes/SmartNotesView';
import { FlashcardsView } from '../flashcards/FlashcardsView';
import { PracticeTestsView } from '../practice/PracticeTestsView';
import { RevisionCentreView } from '../revision/RevisionCentreView';
import { SubjectsView } from '../subjects/SubjectsView';
import { AnalyticsView } from '../analytics/AnalyticsView';
import { StudyLibraryView } from '../library/StudyLibraryView';
import { SettingsView } from '../settings/SettingsView';
import { CyberShieldLabView } from '../security/CyberShieldLabView';
import { AuthModal } from '../modals/AuthModal';
import { PaymentModal } from '../modals/PaymentModal';
import { EmailsModal } from '../modals/EmailsModal';
import { QuickAssistantDrawer } from '../modals/QuickAssistantDrawer';
import { OnboardingModal } from '../modals/OnboardingModal';
import {
  Sparkles,
  Flame,
  Zap,
  Mail,
  Smartphone,
  Maximize2,
  Minimize2,
  BookOpen,
  ArrowDownToLine,
  Share2,
  ShieldCheck,
} from 'lucide-react';

export const MobileAppShell: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    user,
    setAuthModalOpen,
    setSubscriptionModalOpen,
    setQuickAssistantOpen,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const [emailsModalOpen, setEmailsModalOpen] = useState(false);
  const [simulatorMode, setSimulatorMode] = useState(true);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'tutor':
        return <AiTutorView />;
      case 'planner':
        return <StudyPlannerView />;
      case 'notes':
        return <SmartNotesView />;
      case 'flashcards':
        return <FlashcardsView />;
      case 'practice':
        return <PracticeTestsView />;
      case 'revision':
        return <RevisionCentreView />;
      case 'subjects':
        return <SubjectsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'library':
        return <StudyLibraryView />;
      case 'settings':
        return <SettingsView onOpenEmails={() => setEmailsModalOpen(true)} />;
      case 'cybershield':
        return <CyberShieldLabView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center sm:p-4 select-none">
      {/* Desktop Helper Bar: Simulator Frame Toggle & Install PWA */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md mb-2 text-xs text-slate-400 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-300">STUDYOS Mobile App</span>
          <span className="text-[10px] text-slate-500">by bhaleinc</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInstallGuideOpen(true)}
            className="flex items-center gap-1 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px]"
            title="Install on Mobile Home Screen"
          >
            <ArrowDownToLine className="w-3 h-3 text-indigo-400" />
            <span>Install App</span>
          </button>

          <button
            onClick={() => setSimulatorMode(!simulatorMode)}
            className="flex items-center gap-1 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px]"
            title="Toggle Phone Frame"
          >
            <Smartphone className="w-3 h-3" />
            <span>{simulatorMode ? 'Full Screen' : 'Device Frame'}</span>
          </button>
        </div>
      </div>

      {/* Main Mobile App Frame */}
      <div
        className={`w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col relative overflow-hidden transition-all duration-300 ${
          simulatorMode
            ? 'sm:max-w-[430px] sm:h-[890px] sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 sm:shadow-2xl sm:ring-1 sm:ring-slate-700'
            : 'max-w-2xl min-h-screen sm:rounded-2xl sm:border border-slate-800'
        }`}
      >
        {/* Dynamic Island / Notch on Desktop Phone Simulator */}
        {simulatorMode && (
          <div className="hidden sm:flex absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-900/80 mr-3" />
            <div className="w-2 h-2 rounded-full bg-blue-900/60" />
          </div>
        )}

        {/* Mobile Status Bar */}
        <MobileStatusBar />

        {/* Compact Mobile App Header */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 py-2 flex items-center justify-between shrink-0 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-1.5 focus:outline-none"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div className="text-left min-w-0">
                <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white">
                  STUDY<span className="text-indigo-600 dark:text-indigo-400">OS</span>
                </span>
                <span className="block text-[7.5px] font-extrabold tracking-widest uppercase text-slate-400 -mt-0.5 truncate">
                  by bhaleinc
                </span>
              </div>
            </button>
          </div>

          {/* Quick Metrics & User Action */}
          <div className="flex items-center gap-1.5 shrink-0">
            {user && (
              <>
                <button
                  onClick={() => setActiveTab('cybershield')}
                  className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 px-2 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 dark:text-emerald-300"
                  title="CyberShield Armor & Brute Force Defense Lab"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Armor</span>
                </button>

                <div className="flex items-center gap-1 bg-amber-50 dark:bg-slate-800/80 border border-amber-200/70 dark:border-slate-700 px-2 py-0.5 rounded-full text-[11px] font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  <Flame className="w-3 h-3 fill-amber-500" />
                  <span>{user.streakDays}d</span>
                </div>

                <button
                  onClick={() => setEmailsModalOpen(true)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full"
                  title="Transactional notifications"
                >
                  <Mail className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className="w-7 h-7 rounded-full overflow-hidden border border-indigo-500/40 shrink-0"
                >
                  <img
                    src={user.avatarUrl || '/src/assets/images/avatar_student_sarah_1793957070719.jpg'}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              </>
            )}

            {!user && (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Mobile Content Viewport */}
        <main className="flex-1 overflow-y-auto pb-24 overscroll-contain">
          {renderActiveView()}
        </main>

        {/* Fixed Ergonomic Bottom Tab Navigation */}
        <MobileBottomNav onOpenMenu={() => setMenuOpen(true)} isMenuOpen={menuOpen} />

        {/* All Modules Bottom Sheet Drawer */}
        <MobileModulesSheet
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onOpenEmails={() => setEmailsModalOpen(true)}
        />
      </div>

      {/* Global Modals */}
      <AuthModal />
      <PaymentModal />
      <EmailsModal isOpen={emailsModalOpen} onClose={() => setEmailsModalOpen(false)} />
      <QuickAssistantDrawer />
      <OnboardingModal />

      {/* PWA Home Screen Install Modal */}
      {installGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-4 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Install STUDYOS Mobile App</h3>
              <p className="text-slate-500 mt-1">Add to your home screen for instant fullscreen access.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 text-slate-700 dark:text-slate-300">
              <p><strong>On iOS Safari:</strong> Tap <Share2 className="w-3.5 h-3.5 inline mx-1" /> Share, then tap <strong>"Add to Home Screen"</strong>.</p>
              <p><strong>On Android Chrome:</strong> Tap the 3-dot menu, then tap <strong>"Install app"</strong> or "Add to Home screen".</p>
            </div>
            <button
              onClick={() => setInstallGuideOpen(false)}
              className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
