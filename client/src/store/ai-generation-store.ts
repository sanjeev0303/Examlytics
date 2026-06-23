import { create } from 'zustand';

interface Question {
  id: string;
  text: string;
  options: string[];
  type: string;
  difficulty: string;
  topic?: string;
}

interface AIGenerationState {
  questions: Question[];
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress: number;
  error: string | null;
  addQuestion: (question: Question) => void;
  setStatus: (status: AIGenerationState['status']) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAIGenerationStore = create<AIGenerationState>((set) => ({
  questions: [],
  status: 'idle',
  progress: 0,
  error: null,
  addQuestion: (question) => set((state) => ({ questions: [...state.questions, question] })),
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),
  reset: () => set({ questions: [], status: 'idle', progress: 0, error: null }),
}));
