import { LearningMode } from '../types';

export interface TutorResponse {
  success: boolean;
  text?: string;
  suggestedFollowUps?: string[];
  error?: string;
}

export async function askAiTutor(params: {
  message: string;
  mode: LearningMode;
  subject: string;
  imageBase64?: string;
  mimeType?: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}): Promise<TutorResponse> {
  const res = await fetch('/api/gemini/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to get answer from AI Tutor');
  }
  return data;
}

export async function generateSmartNotes(params: {
  topicOrText: string;
  subject: string;
  chapter: string;
  mode: 'short' | 'detailed' | 'exam' | 'definitions' | 'formulas' | 'summary';
  imageBase64?: string;
  mimeType?: string;
}): Promise<string> {
  const res = await fetch('/api/gemini/generate-notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate notes');
  }
  return data.content;
}

export async function generateAiFlashcards(params: {
  sourceText: string;
  subject: string;
  chapter: string;
  count?: number;
  difficulty?: string;
}): Promise<Array<{ front: string; back: string; difficulty: 'Easy' | 'Medium' | 'Hard' }>> {
  const res = await fetch('/api/gemini/generate-flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate flashcards');
  }
  return data.flashcards;
}

export async function generatePracticeTest(params: {
  subject: string;
  chapter: string;
  questionCount?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  questionTypes?: string[];
}): Promise<any> {
  const res = await fetch('/api/gemini/generate-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate test');
  }
  return data.test;
}

export async function generateAiStudyPlan(params: {
  subjects: string[];
  availableHours: number;
  examDates: { subject: string; date: string; name: string }[];
  learningGoals: string[];
  planType: 'daily' | 'weekly' | 'exam_prep';
}): Promise<any[]> {
  const res = await fetch('/api/gemini/study-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate study plan');
  }
  return data.tasks;
}

export async function extractTextFromImage(imageBase64: string, mimeType = 'image/jpeg'): Promise<string> {
  const res = await fetch('/api/gemini/extract-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to extract text');
  }
  return data.extractedText;
}
