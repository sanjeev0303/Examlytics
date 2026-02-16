export interface ExamHistoryItem {
    id?: string;
    sessionId: string;
    title?: string; // Some components use title
    topicName?: string;
    status: string;
    startedAt: string;
    accuracy: number;
    score: number;
    totalQuestions: number;
    timeTaken: number;
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    type: string;
}

export interface AnalysisResult {
    sessionId: string;
    accuracy: number;
    timeTaken: number;
    correctCount: number;
    totalQuestions: number;
    topicAnalysis: Record<string, {
        accuracy: number;
        questionCount: number;
    }>;
}
