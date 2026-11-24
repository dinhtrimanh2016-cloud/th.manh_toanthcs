export type UserRole = "teacher" | "student";

export type AppView =
  | "dashboard"
  | "lectures"
  | "quiz"
  | "game"
  | "leaderboard"
  | "chatbot"
  | "students"
  | "settings";

export interface UserAccount {
  username: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  className: string;
  xp: number;
  bestGame: number;
  gameLevel: string;
  completedLectures: string[];
}

export interface LectureSection {
  heading: string;
  body: string;
  formula?: string;
  bullets?: string[];
  example?: {
    title: string;
    content: string;
  };
}

export interface Lecture {
  id: string;
  category: "Giải tích" | "Đại số" | "Hình học" | "Xác suất";
  grade: string;
  title: string;
  duration: string;
  summary: string;
  rawContent?: string;
  pdfTitle?: string;
  pdfUrl?: string;
  sections: LectureSection[];
}

export interface PdfDocument {
  id: string;
  title: string;
  category: "Giải tích" | "Đại số" | "Hình học" | "Xác suất" | "Tổng hợp";
  grade: string;
  description: string;
  pdfUrl: string;
  uploadedBy: string;
  createdAt: string;
}

export type QuestionType = "trac_nghiem" | "tu_luan";

export interface QuizQuestion {
  id: string;
  topic: string;
  type: QuestionType;
  q: string;
  options: string[];
  answer: number;
  essayAnswer?: string;
  explain: string;
}

export interface QuizBank {
  id: string;
  title: string;
  category: string;
  timeMinutes: number;
  level: string;
  questions: QuizQuestion[];
}

export interface QuizResult {
  id: string;
  username: string;
  name: string;
  className: string;
  topic: string;
  correct: number;
  total: number;
  score: number;
  time: string;
  syncedToSheet?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  source?: "gemini" | "local";
  timestamp: string;
}
