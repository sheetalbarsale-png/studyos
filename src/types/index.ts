export type LearningMode = 
  | 'eli10' // Explain Like I'm 10
  | 'simple' // Simple Explanation
  | 'detailed' // Detailed Explanation
  | 'exam_prep' // Exam Preparation
  | 'step_by_step' // Step-by-Step Solution
  | 'conceptual' // Conceptual Understanding
  | 'real_world'; // Real-World Examples

export type Subject = 
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'English'
  | 'History'
  | 'Geography'
  | 'Computer Science'
  | 'Economics'
  | 'Languages';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  educationLevel: 'Middle School' | 'High School' | 'College/University' | 'Competitive Exam Aspirant';
  institution?: string;
  subjects: string[];
  learningGoals: string[];
  examinationDates: { subject: string; date: string; name: string }[];
  preferredStudyHoursPerDay: number;
  studyDaysPerWeek: number;
  plan: 'free' | 'pro' | 'plus';
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  avatarUrl?: string;
  onboarded: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: LearningMode;
  subject?: string;
  imageUrl?: string;
  reasoningSteps?: string[];
  suggestedFollowUps?: string[];
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  chapter?: string;
  dueDate: string;
  durationMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  notes?: string;
  scheduledTime?: string;
  isAiGenerated?: boolean;
}

export interface SmartNote {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  mode: 'short' | 'detailed' | 'exam' | 'definitions' | 'formulas' | 'summary';
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string; // Question or concept
  back: string; // Answer, explanation, or formula
  subject: string;
  chapter?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  leitnerBox: number; // 1 to 5 for spaced repetition
  nextReviewDate: string;
  reviewsCount: number;
  correctCount: number;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  cardsCount: number;
  masteredCount: number;
  createdAt: string;
}

export interface PracticeQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'true_false' | 'short_answer' | 'fill_in_the_blank' | 'numerical';
  options?: string[]; // for mcq
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
}

export interface PracticeTest {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimitMinutes: number;
  questions: PracticeQuestion[];
  createdAt: string;
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  subject: string;
  date: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeSpentSeconds: number;
  userAnswers: Record<string, string>;
  topicBreakdown: { topic: string; correct: number; total: number }[];
  weakTopics: string[];
  recommendedRevision: string[];
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  unlocked: boolean;
  category: 'streak' | 'mastery' | 'practice' | 'notes';
}

export interface RevisionItem {
  id: string;
  topic: string;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  lastStudied: string;
  urgency: 'high' | 'medium' | 'low';
  reason: 'weak_test_score' | 'spaced_repetition' | 'upcoming_exam' | 'flashcard_lapses';
  confidenceScore: number; // 0 - 100
}
