import { create } from 'zustand';
import { Question } from '@/types';

export interface AIWorkflowState {
  sessionId: string | null;
  status: 'idle' | 'generating' | 'completed' | 'error';
  currentNode: string | null;
  progress: number;
  questions: Question[];
  analytics: any | null;
  recommendations: any | null;
  error: string | null;

  setSessionId: (id: string | null) => void;
  setStatus: (status: AIWorkflowState['status']) => void;
  setCurrentNode: (node: string) => void;
  setProgress: (progress: number) => void;
  addQuestion: (question: Question) => void;
  setAnalytics: (analytics: any) => void;
  setRecommendations: (recs: any) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAIWorkflowStore = create<AIWorkflowState>((set) => ({
  sessionId: null,
  status: 'idle',
  currentNode: null,
  progress: 0,
  questions: [],
  analytics: null,
  recommendations: null,
  error: null,

  setSessionId: (id) => set({ sessionId: id }),
  setStatus: (status) => set({ status }),
  setCurrentNode: (node) => set({ currentNode: node }),
  setProgress: (progress) => set({ progress }),
  addQuestion: (question) => set((state) => ({ questions: [...state.questions, question] })),
  setAnalytics: (analytics) => set({ analytics }),
  setRecommendations: (recs) => set({ recommendations: recs }),
  setError: (error) => set({ error }),
  reset: () => set({
    sessionId: null,
    status: 'idle',
    currentNode: null,
    progress: 0,
    questions: [],
    analytics: null,
    recommendations: null,
    error: null,
  }),
}));
