export type AIStreamEventType =
  | "started"
  | "progress"
  | "retrieval_started"
  | "retrieval_completed"
  | "question_generated"
  | "question_validated"
  | "difficulty_scored"
  | "bloom_scored"
  | "analytics_generated"
  | "recommendations_generated"
  | "completed"
  | "error";

export interface AIStreamEvent<T = unknown> {
  eventId: string;
  sessionId: string;
  timestamp: string;
  type: AIStreamEventType;
  node: string;
  progress: number;
  payload?: T;
  error?: string;
}
