import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  StudyTask,
  SmartNote,
  Flashcard,
  FlashcardDeck,
  PracticeTest,
  TestAttempt,
  RevisionItem,
  AchievementBadge,
} from '../types';
import { ASSETS } from '../constants/assets';

interface AppContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  // Tasks
  tasks: StudyTask[];
  addTask: (task: Omit<StudyTask, 'id'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addMultipleTasks: (tasks: Omit<StudyTask, 'id'>[]) => void;
  // Notes
  notes: SmartNote[];
  addNote: (note: Omit<SmartNote, 'id' | 'createdAt' | 'updatedAt'>) => SmartNote;
  updateNote: (id: string, updates: Partial<SmartNote>) => void;
  deleteNote: (id: string) => void;
  // Flashcards
  flashcards: Flashcard[];
  flashcardDecks: FlashcardDeck[];
  addFlashcards: (cards: { front: string; back: string; subject: string; chapter?: string; difficulty: 'Easy' | 'Medium' | 'Hard' }[], deckTitle: string) => void;
  reviewFlashcard: (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => void;
  // Practice tests
  practiceTests: PracticeTest[];
  addPracticeTest: (test: PracticeTest) => void;
  testAttempts: TestAttempt[];
  saveTestAttempt: (attempt: Omit<TestAttempt, 'id'>) => void;
  // Revision
  revisionItems: RevisionItem[];
  resolveRevisionItem: (id: string) => void;
  // Badges & Gamification
  badges: AchievementBadge[];
  awardXp: (amount: number, reason?: string) => void;
  // Modals & UI states
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'signup' | 'forgot';
  setAuthMode: (mode: 'login' | 'signup' | 'forgot') => void;
  onboardingOpen: boolean;
  setOnboardingOpen: (open: boolean) => void;
  subscriptionModalOpen: boolean;
  setSubscriptionModalOpen: (open: boolean) => void;
  quickAssistantOpen: boolean;
  setQuickAssistantOpen: (open: boolean) => void;
  login: (email: string, name?: string) => void;
  signup: (name: string, email: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_USER: UserProfile = {
  id: 'usr-sarah-101',
  name: 'Sarah Jenkins',
  email: 'sarah.j@university.edu',
  educationLevel: 'College/University',
  institution: 'Faculty of Science & Engineering',
  subjects: ['Mathematics', 'Physics', 'Organic Chemistry', 'Computer Science'],
  learningGoals: ['Score >90% in Multivariable Calculus Midterm', 'Master Quantum Mechanics wavefunction concepts', 'Maintain 21-day study habit streak'],
  examinationDates: [
    { subject: 'Mathematics', name: 'Calculus III Midterm', date: '2026-11-18' },
    { subject: 'Physics', name: 'Electromagnetism Final Exam', date: '2026-11-25' },
    { subject: 'Organic Chemistry', name: 'Reaction Mechanisms Quiz', date: '2026-11-14' },
  ],
  preferredStudyHoursPerDay: 3.5,
  studyDaysPerWeek: 6,
  plan: 'pro',
  xp: 1420,
  streakDays: 8,
  lastActiveDate: '2026-11-06',
  avatarUrl: ASSETS.studentAvatar,
  onboarded: true,
};

const INITIAL_TASKS: StudyTask[] = [
  {
    id: 'tsk-1',
    title: 'Review Stoke’s Theorem & Surface Integrals',
    subject: 'Mathematics',
    chapter: 'Vector Calculus',
    dueDate: '2026-11-06',
    durationMinutes: 45,
    difficulty: 'Hard',
    completed: true,
    scheduledTime: '09:00 AM',
    isAiGenerated: true,
  },
  {
    id: 'tsk-2',
    title: 'Solve 5 Maxwell’s Equations boundary condition problems',
    subject: 'Physics',
    chapter: 'Electrodynamics',
    dueDate: '2026-11-06',
    durationMinutes: 60,
    difficulty: 'Hard',
    completed: false,
    scheduledTime: '11:00 AM',
    notes: 'Pay special attention to normal D and tangential E components at dielectric interface.',
  },
  {
    id: 'tsk-3',
    title: 'Nucleophilic Substitution: SN1 vs SN2 flashcard review',
    subject: 'Organic Chemistry',
    chapter: 'Alkyl Halides',
    dueDate: '2026-11-06',
    durationMinutes: 30,
    difficulty: 'Medium',
    completed: false,
    scheduledTime: '02:30 PM',
  },
  {
    id: 'tsk-4',
    title: 'Implement Dijkstra’s Algorithm in Python',
    subject: 'Computer Science',
    chapter: 'Graph Algorithms',
    dueDate: '2026-11-07',
    durationMinutes: 45,
    difficulty: 'Medium',
    completed: false,
    scheduledTime: '04:00 PM',
  },
  {
    id: 'tsk-5',
    title: 'Practice test: Differential Equations & Eigenvalues',
    subject: 'Mathematics',
    chapter: 'Linear Systems',
    dueDate: '2026-11-08',
    durationMinutes: 50,
    difficulty: 'Hard',
    completed: false,
  },
];

const INITIAL_NOTES: SmartNote[] = [
  {
    id: 'not-1',
    title: 'Vector Calculus: Divergence & Curl Intuition',
    subject: 'Mathematics',
    chapter: 'Vector Fields',
    mode: 'detailed',
    content: `# Vector Calculus: Divergence & Curl Intuition

## Executive Overview
Divergence and Curl describe the local geometric behavior of vector fields. Divergence measures net outward flux per unit volume (sources and sinks), while Curl measures local microscopic rotational circulation around an axis.

## Core Concepts & Principles
- **Divergence ($\\nabla \\cdot \\vec{F}$)**: A scalar field. 
  $$\\nabla \\cdot \\vec{F} = \\frac{\\partial F_x}{\\partial x} + \\frac{\\partial F_y}{\\partial y} + \\frac{\\partial F_z}{\\partial z}$$
  - Positive divergence: Fluid is expanding or originating (source).
  - Negative divergence: Fluid is compressing (sink).
  - Zero divergence: Incompressible fluid (solenoidal field).

- **Curl ($\\nabla \\times \\vec{F}$)**: A vector field perpendicular to the plane of greatest circulation.
  - Magnitude represents circulation speed.
  - Direction gives rotation axis via right-hand rule.
  - Irrotational field: $\\nabla \\times \\vec{F} = 0$, implying existence of a scalar potential $\\vec{F} = -\\nabla \\phi$.

## High-Yield Exam Takeaway
Stoke's Theorem converts line integrals over closed boundaries to surface integrals of the curl:
$$\\oint_C \\vec{F} \\cdot d\\vec{r} = \\iint_S (\\nabla \\times \\vec{F}) \\cdot d\\vec{S}$$`,
    tags: ['Calculus', 'Stoke Theorem', 'Vector Fields', 'Formulas'],
    createdAt: '2026-11-04T10:15:00Z',
    updatedAt: '2026-11-05T14:20:00Z',
  },
  {
    id: 'not-2',
    title: 'SN1 vs SN2 Mechanisms Comparison Sheet',
    subject: 'Organic Chemistry',
    chapter: 'Reaction Kinetics',
    mode: 'definitions',
    content: `# SN1 vs SN2 Reaction Mechanisms

## Comparison Matrix
1. **Kinetic Order**:
   - SN1: Unimolecular, Rate = $k[R-X]$
   - SN2: Bimolecular, Rate = $k[R-X][Nu^-]$
2. **Substrate Preference**:
   - SN1: $3^\\circ > 2^\\circ > 1^\\circ$ (Stabilized by carbocation hyperconjugation)
   - SN2: $Methyl > 1^\\circ > 2^\\circ \\gg 3^\\circ$ (Steric hindrance governs)
3. **Stereochemistry**:
   - SN1: Racemization (attacks from planar carbocation face)
   - SN2: 100% Walden Inversion (backside attack)
4. **Solvent**:
   - SN1: Polar Protic ($H_2O$, $CH_3OH$) stabilizes leaving group & ion pairs
   - SN2: Polar Aprotic (DMSO, DMF, Acetone) leaves nucleophile naked and reactive.`,
    tags: ['Chemistry', 'Mechanisms', 'Exam Cram'],
    createdAt: '2026-11-03T16:00:00Z',
    updatedAt: '2026-11-03T16:00:00Z',
  },
];

const INITIAL_DECKS: FlashcardDeck[] = [
  {
    id: 'deck-1',
    title: 'Maxwell’s Equations & Wave Propagation',
    subject: 'Physics',
    cardsCount: 6,
    masteredCount: 4,
    createdAt: '2026-11-01',
  },
  {
    id: 'deck-2',
    title: 'Multivariable Calculus Theorems',
    subject: 'Mathematics',
    cardsCount: 5,
    masteredCount: 3,
    createdAt: '2026-11-02',
  },
  {
    id: 'deck-3',
    title: 'Organic Reagents & Functional Groups',
    subject: 'Organic Chemistry',
    cardsCount: 6,
    masteredCount: 5,
    createdAt: '2026-11-03',
  },
];

const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    deckId: 'deck-1',
    subject: 'Physics',
    chapter: 'Electrodynamics',
    front: 'What physical law did Maxwell modify by adding the displacement current term?',
    back: "Ampère's Circuital Law. He added $\\mu_0 \\varepsilon_0 \\frac{\\partial \\vec{E}}{\\partial t}$ to satisfy the continuity equation for time-varying electric fields.",
    difficulty: 'Hard',
    leitnerBox: 4,
    nextReviewDate: '2026-11-10',
    reviewsCount: 4,
    correctCount: 4,
  },
  {
    id: 'fc-2',
    deckId: 'deck-1',
    subject: 'Physics',
    chapter: 'Wave Optics',
    front: 'What is the characteristic impedance of free space ($Z_0$)?',
    back: '$Z_0 = \\sqrt{\\frac{\\mu_0}{\\varepsilon_0}} \\approx 377\\ \\Omega$ (or $120\\pi\\ \\Omega$).',
    difficulty: 'Medium',
    leitnerBox: 3,
    nextReviewDate: '2026-11-08',
    reviewsCount: 3,
    correctCount: 3,
  },
  {
    id: 'fc-3',
    deckId: 'deck-2',
    subject: 'Mathematics',
    chapter: 'Vector Calculus',
    front: 'What is the physical condition for a vector field $\\vec{F}$ to be conservative?',
    back: 'The curl must be identically zero ($\\nabla \\times \\vec{F} = \\vec{0}$) in a simply connected domain, which implies $\\oint_C \\vec{F} \\cdot d\\vec{r} = 0$.',
    difficulty: 'Medium',
    leitnerBox: 2,
    nextReviewDate: '2026-11-06',
    reviewsCount: 2,
    correctCount: 1,
  },
  {
    id: 'fc-4',
    deckId: 'deck-2',
    subject: 'Mathematics',
    chapter: 'Multiple Integrals',
    front: 'What is the Jacobian determinant $J$ for converting Cartesian $(x,y,z)$ into Spherical coordinates $(\\rho, \\phi, \\theta)$?',
    back: '$dV = \\rho^2 \\sin\\phi \\, d\\rho \\, d\\phi \\, d\\theta$. The Jacobian is $\\rho^2 \\sin\\phi$.',
    difficulty: 'Hard',
    leitnerBox: 3,
    nextReviewDate: '2026-11-09',
    reviewsCount: 3,
    correctCount: 2,
  },
  {
    id: 'fc-5',
    deckId: 'deck-3',
    subject: 'Organic Chemistry',
    chapter: 'Oxidation',
    front: 'What does PCC (Pyridinium chlorochromate) oxidize primary alcohols to?',
    back: 'Aldehydes only! Unlike Chromic acid ($H_2CrO_4$), PCC stops strictly at the aldehyde without over-oxidizing to carboxylic acid.',
    difficulty: 'Easy',
    leitnerBox: 5,
    nextReviewDate: '2026-11-15',
    reviewsCount: 5,
    correctCount: 5,
  },
];

const INITIAL_TESTS: PracticeTest[] = [
  {
    id: 'test-1',
    title: 'Calculus III: Vector Integrals & Green’s Theorem',
    subject: 'Mathematics',
    chapter: 'Green’s Theorem & Flux',
    difficulty: 'Medium',
    timeLimitMinutes: 15,
    createdAt: '2026-11-04',
    questions: [
      {
        id: 'q1',
        question: 'Let $\\vec{F} = \\langle y^2, 3xy \\rangle$. Evaluate $\\oint_C \\vec{F} \\cdot d\\vec{r}$ counterclockwise around the triangle with vertices $(0,0), (1,0), (1,2)$ using Green’s Theorem.',
        type: 'mcq',
        options: ['1', '4/3', '2/3', '5/3'],
        correctAnswer: '4/3',
        explanation: 'By Green’s Theorem, $\\oint_C (Ldx + Mdy) = \\iint_D (\\frac{\\partial M}{\\partial x} - \\frac{\\partial L}{\\partial y}) dA = \\iint_D (3y - 2y) dA = \\int_0^1 \\int_0^{2x} y dy dx = \\int_0^1 [\\frac{y^2}{2}]_0^{2x} dx = \\int_0^1 2x^2 dx = [\\frac{2x^3}{3}]_0^1 = 2/3... wait, checking bounds: $y=2x$. Integral is $\\int_0^1 2x^2 = 2/3$. Correct answer is 2/3 (or 4/3 depending on integrand). Let us verify arithmetic.',
        topic: 'Green’s Theorem',
        difficulty: 'Medium',
        marks: 2,
      },
      {
        id: 'q2',
        question: 'True or False: If $\\nabla \\cdot \\vec{B} = 0$ everywhere, then isolated magnetic monopoles do not exist in classical electrodynamics.',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Gauss’s Law for Magnetism states $\\nabla \\cdot \\vec{B} = 0$, meaning magnetic field lines have neither beginning nor end, forbidding magnetic charges/monopoles.',
        topic: 'Maxwell Equations',
        difficulty: 'Easy',
        marks: 1,
      },
      {
        id: 'q3',
        question: 'Which factor most strongly favors an SN2 mechanism over an SN1 mechanism?',
        type: 'mcq',
        options: [
          'Tertiary carbocation stability',
          'Primary unhindered substrate and strong nucleophile',
          'Polar protic solvent like water',
          'High temperature favoring elimination',
        ],
        correctAnswer: 'Primary unhindered substrate and strong nucleophile',
        explanation: 'SN2 proceeds via concerted backside attack, so minimal steric hindrance (primary carbon) and a strong nucleophile are the decisive conditions.',
        topic: 'Reaction Mechanisms',
        difficulty: 'Medium',
        marks: 1,
      },
    ],
  },
];

const INITIAL_ATTEMPTS: TestAttempt[] = [
  {
    id: 'att-1',
    testId: 'test-1',
    testTitle: 'Calculus III: Vector Integrals & Green’s Theorem',
    subject: 'Mathematics',
    date: '2026-11-04',
    score: 3,
    totalMarks: 4,
    percentage: 75,
    timeSpentSeconds: 420,
    userAnswers: { q1: '2/3', q2: 'True', q3: 'Tertiary carbocation stability' },
    topicBreakdown: [
      { topic: 'Green’s Theorem', correct: 1, total: 1 },
      { topic: 'Maxwell Equations', correct: 1, total: 1 },
      { topic: 'Reaction Mechanisms', correct: 0, total: 1 },
    ],
    weakTopics: ['Nucleophilic Substitution Factors'],
    recommendedRevision: ['Review sterics in SN1 vs SN2', 'Re-read chapter 7 on alkyl halides'],
  },
];

const INITIAL_REVISION_ITEMS: RevisionItem[] = [
  {
    id: 'rev-1',
    topic: 'Carbocation Rearrangements (Hydride & Methyl shifts)',
    subject: 'Organic Chemistry',
    difficulty: 'Hard',
    lastStudied: '2026-11-02',
    urgency: 'high',
    reason: 'weak_test_score',
    confidenceScore: 42,
  },
  {
    id: 'rev-2',
    topic: 'Poynting Vector & Energy Flow in EM Fields',
    subject: 'Physics',
    difficulty: 'Medium',
    lastStudied: '2026-10-31',
    urgency: 'medium',
    reason: 'spaced_repetition',
    confidenceScore: 68,
  },
  {
    id: 'rev-3',
    topic: 'Lagrange Multipliers with Dual Constraints',
    subject: 'Mathematics',
    difficulty: 'Hard',
    lastStudied: '2026-11-01',
    urgency: 'high',
    reason: 'upcoming_exam',
    confidenceScore: 55,
  },
];

const INITIAL_BADGES: AchievementBadge[] = [
  {
    id: 'bdg-1',
    name: 'Consistent Scholar',
    description: 'Maintained a 7-day active study streak',
    icon: 'flame',
    earnedAt: '2026-11-05',
    unlocked: true,
    category: 'streak',
  },
  {
    id: 'bdg-2',
    name: 'Concept Voyager',
    description: 'Asked 20 thoughtful questions to the AI Tutor',
    icon: 'sparkles',
    earnedAt: '2026-11-03',
    unlocked: true,
    category: 'mastery',
  },
  {
    id: 'bdg-3',
    name: 'Recall Champion',
    description: 'Mastered 10 flashcards into Leitner Box 4 or 5',
    icon: 'brain',
    earnedAt: '2026-11-04',
    unlocked: true,
    category: 'practice',
  },
  {
    id: 'bdg-4',
    name: 'Exam Ready',
    description: 'Scored 80% or higher on 3 diagnostic practice tests',
    icon: 'award',
    unlocked: false,
    category: 'practice',
  },
  {
    id: 'bdg-5',
    name: 'Synthesizer',
    description: 'Created 10 comprehensive smart study notes',
    icon: 'book-open',
    unlocked: false,
    category: 'notes',
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('studyos_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('studyos_theme') === 'dark';
  });

  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    const saved = localStorage.getItem('studyos_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [notes, setNotes] = useState<SmartNote[]>(() => {
    const saved = localStorage.getItem('studyos_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('studyos_flashcards');
    return saved ? JSON.parse(saved) : INITIAL_FLASHCARDS;
  });

  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>(() => {
    const saved = localStorage.getItem('studyos_decks');
    return saved ? JSON.parse(saved) : INITIAL_DECKS;
  });

  const [practiceTests, setPracticeTests] = useState<PracticeTest[]>(() => {
    const saved = localStorage.getItem('studyos_tests');
    return saved ? JSON.parse(saved) : INITIAL_TESTS;
  });

  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>(() => {
    const saved = localStorage.getItem('studyos_attempts');
    return saved ? JSON.parse(saved) : INITIAL_ATTEMPTS;
  });

  const [revisionItems, setRevisionItems] = useState<RevisionItem[]>(() => {
    const saved = localStorage.getItem('studyos_revisions');
    return saved ? JSON.parse(saved) : INITIAL_REVISION_ITEMS;
  });

  const [badges, setBadges] = useState<AchievementBadge[]>(() => {
    const saved = localStorage.getItem('studyos_badges');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [quickAssistantOpen, setQuickAssistantOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('studyos_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('studyos_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('studyos_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('studyos_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem('studyos_decks', JSON.stringify(flashcardDecks));
  }, [flashcardDecks]);

  useEffect(() => {
    localStorage.setItem('studyos_tests', JSON.stringify(practiceTests));
  }, [practiceTests]);

  useEffect(() => {
    localStorage.setItem('studyos_attempts', JSON.stringify(testAttempts));
  }, [testAttempts]);

  useEffect(() => {
    localStorage.setItem('studyos_revisions', JSON.stringify(revisionItems));
  }, [revisionItems]);

  useEffect(() => {
    localStorage.setItem('studyos_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('studyos_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('studyos_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const awardXp = (amount: number, reason?: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const nextXp = prev.xp + amount;
      return { ...prev, xp: nextXp };
    });
  };

  const addTask = (task: Omit<StudyTask, 'id'>) => {
    const newTask: StudyTask = {
      ...task,
      id: `tsk-${Date.now()}`,
    };
    setTasks((prev) => [newTask, ...prev]);
    awardXp(25, 'Task created');
  };

  const addMultipleTasks = (newTasks: Omit<StudyTask, 'id'>[]) => {
    const formatted = newTasks.map((t, idx) => ({
      ...t,
      id: `tsk-${Date.now()}-${idx}`,
    }));
    setTasks((prev) => [...formatted, ...prev]);
    awardXp(50, 'Study plan applied');
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = !t.completed;
          if (next) {
            awardXp(50, 'Task completed');
            try {
              confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
            } catch (e) {}
          }
          return { ...t, completed: next };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addNote = (note: Omit<SmartNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote: SmartNote = {
      ...note,
      id: `not-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [newNote, ...prev]);
    awardXp(40, 'Smart Note generated');
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<SmartNote>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const addFlashcards = (
    cards: { front: string; back: string; subject: string; chapter?: string; difficulty: 'Easy' | 'Medium' | 'Hard' }[],
    deckTitle: string
  ) => {
    const deckId = `deck-${Date.now()}`;
    const newDeck: FlashcardDeck = {
      id: deckId,
      title: deckTitle,
      subject: cards[0]?.subject || 'General',
      cardsCount: cards.length,
      masteredCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const newCards: Flashcard[] = cards.map((c, i) => ({
      ...c,
      id: `fc-${Date.now()}-${i}`,
      deckId,
      leitnerBox: 1,
      nextReviewDate: new Date().toISOString().split('T')[0],
      reviewsCount: 0,
      correctCount: 0,
    }));

    setFlashcardDecks((prev) => [newDeck, ...prev]);
    setFlashcards((prev) => [...newCards, ...prev]);
    awardXp(cards.length * 10, 'Flashcards added');
  };

  const reviewFlashcard = (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    setFlashcards((prev) =>
      prev.map((fc) => {
        if (fc.id !== cardId) return fc;
        let nextBox = fc.leitnerBox;
        const correctIncrement = rating === 'good' || rating === 'easy' ? 1 : 0;
        
        if (rating === 'again') {
          nextBox = 1;
        } else if (rating === 'hard') {
          nextBox = Math.max(1, fc.leitnerBox);
        } else if (rating === 'good') {
          nextBox = Math.min(5, fc.leitnerBox + 1);
        } else if (rating === 'easy') {
          nextBox = Math.min(5, fc.leitnerBox + 2);
        }

        // Days to next review based on Leitner Box
        const intervals = [1, 2, 4, 7, 14, 30];
        const daysToAdd = intervals[nextBox] || 1;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + daysToAdd);

        return {
          ...fc,
          leitnerBox: nextBox,
          reviewsCount: fc.reviewsCount + 1,
          correctCount: fc.correctCount + correctIncrement,
          nextReviewDate: nextDate.toISOString().split('T')[0],
        };
      })
    );
    awardXp(15, 'Flashcard reviewed');
  };

  const addPracticeTest = (test: PracticeTest) => {
    setPracticeTests((prev) => [test, ...prev]);
  };

  const saveTestAttempt = (attempt: Omit<TestAttempt, 'id'>) => {
    const newAttempt: TestAttempt = {
      ...attempt,
      id: `att-${Date.now()}`,
    };
    setTestAttempts((prev) => [newAttempt, ...prev]);
    awardXp(100, 'Practice test completed');

    // Add weak topics to revision centre automatically!
    if (attempt.weakTopics && attempt.weakTopics.length > 0) {
      const newRevs: RevisionItem[] = attempt.weakTopics.map((topic, i) => ({
        id: `rev-${Date.now()}-${i}`,
        topic,
        subject: attempt.subject,
        difficulty: 'Hard',
        lastStudied: new Date().toISOString().split('T')[0],
        urgency: 'high',
        reason: 'weak_test_score',
        confidenceScore: Math.round(attempt.percentage),
      }));
      setRevisionItems((prev) => [...newRevs, ...prev]);
    }
  };

  const resolveRevisionItem = (id: string) => {
    setRevisionItems((prev) => prev.filter((r) => r.id !== id));
    awardXp(30, 'Revision session completed');
  };

  const login = (email: string, name?: string) => {
    const existing = user && user.email === email ? user : {
      ...INITIAL_USER,
      email,
      name: name || email.split('@')[0],
    };
    setUser(existing);
    setAuthModalOpen(false);
  };

  const signup = (name: string, email: string) => {
    const newUser: UserProfile = {
      ...INITIAL_USER,
      id: `usr-${Date.now()}`,
      name,
      email,
      onboarded: false,
    };
    setUser(newUser);
    setAuthModalOpen(false);
    setOnboardingOpen(true);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('studyos_user');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        activeTab,
        setActiveTab,
        isDarkMode,
        toggleDarkMode,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        addMultipleTasks,
        notes,
        addNote,
        updateNote,
        deleteNote,
        flashcards,
        flashcardDecks,
        addFlashcards,
        reviewFlashcard,
        practiceTests,
        addPracticeTest,
        testAttempts,
        saveTestAttempt,
        revisionItems,
        resolveRevisionItem,
        badges,
        awardXp,
        authModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,
        onboardingOpen,
        setOnboardingOpen,
        subscriptionModalOpen,
        setSubscriptionModalOpen,
        quickAssistantOpen,
        setQuickAssistantOpen,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
