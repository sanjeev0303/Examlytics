import { ExamService } from "@/services/exam.service";
import { UserService } from "@/services/user.service";
import { AnalyticsService } from "@/services/analytics.service";

export const api = {
  // Exam Service
  getExams: ExamService.getAll,
  getTopics: ExamService.getTopics,
  startExam: ExamService.start,
  submitExam: ExamService.submit,
  getExamSession: ExamService.getSession,
  getExamHistory: ExamService.getHistory,
  getExamStatus: ExamService.getExamStatus,

  // User Service
  onboardUser: UserService.onboard,
  getUsers: UserService.getProfile,
  getAdminStats: UserService.getAdminStats,

  // Analytics Service
  getWeakTopics: AnalyticsService.getWeakTopics,
  getStreaks: AnalyticsService.getStreaks,
};
