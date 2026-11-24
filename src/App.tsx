import React, { useEffect, useState } from "react";
import {
  AppView,
  Lecture,
  PdfDocument,
  QuizQuestion,
  QuizResult,
  UserAccount,
} from "./types";
import {
  computeGameLevel,
  DEFAULT_LECTURES,
  DEFAULT_PDF_DOCUMENTS,
  DEFAULT_QUESTIONS,
  DEFAULT_RESULTS,
  DEFAULT_USERS,
} from "./data/mathData";
import { postToGoogleSheet } from "./utils/googleSheet";
import { AuthScreen } from "./components/AuthScreen";
import { DashboardView } from "./components/DashboardView";
import { LecturesView } from "./components/LecturesView";
import { QuizView } from "./components/QuizView";
import { ArenaGameView } from "./components/ArenaGameView";
import { LeaderboardView } from "./components/LeaderboardView";
import { ChatbotView } from "./components/ChatbotView";
import { StudentsView } from "./components/StudentsView";
import { SheetSettingsView } from "./components/SheetSettingsView";
import {
  BookOpen,
  Bot,
  ClipboardCheck,
  Database,
  LayoutDashboard,
  LogOut,
  Menu,
  SquareFunction,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";

const VIEW_TITLES: Record<AppView, string> = {
  dashboard: "Tổng quan học tập",
  lectures: "Bài giảng & Tài liệu PDF",
  quiz: "Kiểm tra & Ngân hàng câu hỏi",
  game: "Đấu trường Toán học 60s",
  leaderboard: "Bảng xếp hạng",
  chatbot: "Trợ lý AI Giải Toán",
  students: "Quản lý học sinh",
  settings: "Kết nối Google Sheet",
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [users, setUsers] = useState<UserAccount[]>(() =>
    readStorage("mm_users_v3", DEFAULT_USERS)
  );
  const [lectures, setLectures] = useState<Lecture[]>(() =>
    readStorage("mm_lectures_v3", DEFAULT_LECTURES)
  );
  const [documents, setDocuments] = useState<PdfDocument[]>(() =>
    readStorage("mm_documents_v3", DEFAULT_PDF_DOCUMENTS)
  );
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    readStorage("mm_questions_v3", DEFAULT_QUESTIONS)
  );
  const [results, setResults] = useState<QuizResult[]>(() =>
    readStorage("mm_results_v3", DEFAULT_RESULTS)
  );
  const [currentUsername, setCurrentUsername] = useState<string | null>(() =>
    readStorage("mm_currentUsername_v3", null)
  );
  const [gsUrl, setGsUrl] = useState<string>(() =>
    localStorage.getItem("mm_gsUrl_v3") || ""
  );

  const [activeView, setActiveView] = useState<AppView>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentUser =
    users.find((u) => u.username === currentUsername) || null;

  useEffect(() => {
    localStorage.setItem("mm_users_v3", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("mm_lectures_v3", JSON.stringify(lectures));
  }, [lectures]);

  useEffect(() => {
    localStorage.setItem("mm_documents_v3", JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem("mm_questions_v3", JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem("mm_results_v3", JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem(
      "mm_currentUsername_v3",
      JSON.stringify(currentUsername)
    );
  }, [currentUsername]);

  useEffect(() => {
    localStorage.setItem("mm_gsUrl_v3", gsUrl);
  }, [gsUrl]);

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUsername(user.username);
    setActiveView("dashboard");
  };

  const handleRegisterStudent = (newStudent: UserAccount) => {
    setUsers((prev) => [...prev, newStudent]);
    setCurrentUsername(newStudent.username);
    setActiveView("dashboard");
    void postToGoogleSheet(gsUrl, {
      action: "saveUser",
      user: newStudent,
    });
  };

  const handleLogout = () => {
    setCurrentUsername(null);
    setMobileMenuOpen(false);
  };

  const handleCompleteLecture = (lectureId: string) => {
    if (!currentUser) return;
    if (currentUser.completedLectures.includes(lectureId)) return;

    const updatedXp = currentUser.xp + 50;
    const updatedLevel = computeGameLevel(updatedXp);
    const updatedDone = [...currentUser.completedLectures, lectureId];

    setUsers((prev) =>
      prev.map((u) =>
        u.username === currentUser.username
          ? {
              ...u,
              xp: updatedXp,
              gameLevel: updatedLevel,
              completedLectures: updatedDone,
            }
          : u
      )
    );
    void postToGoogleSheet(gsUrl, {
      action: "updateScore",
      username: currentUser.username,
      xp: updatedXp,
      bestGame: currentUser.bestGame,
      gameLevel: updatedLevel,
      completedLectures: updatedDone,
    });
  };

  const handleSaveLecture = (lecture: Lecture) => {
    setLectures((prev) => {
      const exists = prev.some((l) => l.id === lecture.id);
      return exists
        ? prev.map((l) => (l.id === lecture.id ? lecture : l))
        : [lecture, ...prev];
    });
    void postToGoogleSheet(gsUrl, {
      action: "saveLecture",
      lecture,
    });
  };

  const handleDeleteLecture = (id: string) => {
    setLectures((prev) => prev.filter((l) => l.id !== id));
    void postToGoogleSheet(gsUrl, { action: "deleteLecture", id });
  };

  const handleSaveDocument = (doc: PdfDocument) => {
    setDocuments((prev) => {
      const exists = prev.some((d) => d.id === doc.id);
      return exists
        ? prev.map((d) => (d.id === doc.id ? doc : d))
        : [doc, ...prev];
    });
    if (!doc.pdfUrl.startsWith("data:")) {
      void postToGoogleSheet(gsUrl, {
        action: "saveDocument",
        document: doc,
      });
    }
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    void postToGoogleSheet(gsUrl, { action: "deleteDocument", id });
  };

  const handleSaveQuestion = (q: QuizQuestion) => {
    setQuestions((prev) => {
      const exists = prev.some((item) => item.id === q.id);
      return exists
        ? prev.map((item) => (item.id === q.id ? q : item))
        : [q, ...prev];
    });
    void postToGoogleSheet(gsUrl, { action: "saveQuestion", question: q });
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    void postToGoogleSheet(gsUrl, { action: "deleteQuestion", id });
  };

  const handleQuizSubmitted = (record: QuizResult, xpEarned: number) => {
    setResults((prev) => [...prev, record]);
    setUsers((prev) =>
      prev.map((u) => {
        if (u.username !== record.username) return u;
        const nextXp = u.xp + xpEarned;
        return {
          ...u,
          xp: nextXp,
          gameLevel: computeGameLevel(nextXp),
        };
      })
    );
  };

  const handleGameFinish = (score: number, xpEarned: number) => {
    if (!currentUser) return;
    const nextXp = currentUser.xp + xpEarned;
    const nextBest = Math.max(currentUser.bestGame, score);
    const nextLevel = computeGameLevel(nextXp);

    setUsers((prev) =>
      prev.map((u) =>
        u.username === currentUser.username
          ? {
              ...u,
              xp: nextXp,
              bestGame: nextBest,
              gameLevel: nextLevel,
            }
          : u
      )
    );
    void postToGoogleSheet(gsUrl, {
      action: "updateScore",
      username: currentUser.username,
      xp: nextXp,
      bestGame: nextBest,
      gameLevel: nextLevel,
    });
  };

  const handleSyncUsers = (remoteUsers: UserAccount[]) => {
    setUsers((prev) => {
      const map = new Map<string, UserAccount>(prev.map((u) => [u.username, u]));
      remoteUsers.forEach((remote) => {
        const existing = map.get(remote.username);
        const mergedXp = Math.max(existing?.xp || 0, Number(remote.xp) || 0);
        map.set(remote.username, {
          username: remote.username,
          email: remote.email || existing?.email || "",
          password: remote.password || existing?.password || "123456",
          name: remote.name || existing?.name || remote.username,
          role: remote.role || existing?.role || "student",
          className: remote.className || existing?.className || "",
          xp: mergedXp,
          bestGame: Math.max(
            existing?.bestGame || 0,
            Number(remote.bestGame) || 0
          ),
          gameLevel: remote.gameLevel || computeGameLevel(mergedXp),
          completedLectures:
            remote.completedLectures && remote.completedLectures.length > 0
              ? remote.completedLectures
              : existing?.completedLectures || [],
        });
      });
      return Array.from(map.values());
    });
  };

  const handleSyncAllData = (payload: {
    users: UserAccount[];
    lectures: Lecture[];
    documents: PdfDocument[];
    questions: QuizQuestion[];
  }) => {
    if (payload.users.length > 0) handleSyncUsers(payload.users);
    if (payload.lectures.length > 0) setLectures(payload.lectures);
    if (payload.documents.length > 0) setDocuments(payload.documents);
    if (payload.questions.length > 0) setQuestions(payload.questions);
  };

  const handleAddStudent = (st: UserAccount) => {
    setUsers((prev) => [...prev, st]);
    void postToGoogleSheet(gsUrl, { action: "saveUser", user: st });
  };

  const handleUpdateStudent = (
    username: string,
    updates: Partial<UserAccount>
  ) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.username !== username) return u;
        const updated = { ...u, ...updates };
        void postToGoogleSheet(gsUrl, { action: "saveUser", user: updated });
        return updated;
      })
    );
  };

  const handleDeleteStudent = (username: string) => {
    setUsers((prev) => prev.filter((u) => u.username !== username));
    void postToGoogleSheet(gsUrl, { action: "deleteUser", username });
  };

  if (!currentUser) {
    return (
      <AuthScreen
        users={users}
        onLoginSuccess={handleLoginSuccess}
        onRegisterStudent={handleRegisterStudent}
      />
    );
  }

  const navItems: Array<{
    id: AppView;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "dashboard",
      label: "Tổng quan",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "lectures",
      label: "Bài giảng & PDF",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: "quiz",
      label: "Kiểm tra & Câu hỏi",
      icon: <ClipboardCheck className="w-4 h-4" />,
    },
    {
      id: "game",
      label: "Đấu trường 60s",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: "leaderboard",
      label: "Bảng xếp hạng",
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      id: "chatbot",
      label: "Trợ lý AI Giải Toán",
      icon: <Bot className="w-4 h-4" />,
    },
    {
      id: "students",
      label: "Quản lý học sinh",
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "settings",
      label: "Kết nối Google Sheet",
      icon: <Database className="w-4 h-4" />,
    },
  ];

  const navigate = (view: AppView) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/50 z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <SquareFunction className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight whitespace-nowrap">
              MathMaster LMS
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="text-xs text-slate-400">
            <div className="font-semibold text-slate-200 truncate">
              {currentUser.name}
            </div>
            <div className="truncate">
              {currentUser.role === "teacher"
                ? "Giáo viên quản trị"
                : `Lớp ${currentUser.className} · ${currentUser.gameLevel}`}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-600/20 hover:text-rose-300 text-xs font-semibold text-slate-300 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Clean Single-Row Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base lg:text-lg font-bold text-slate-900 truncate">
              {VIEW_TITLES[activeView]}
            </h1>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            <span className="hidden sm:inline text-xs font-medium text-slate-500 tabular-nums whitespace-nowrap">
              {gsUrl ? "Google Sheet: Đã kết nối" : "Lưu trữ: Trình duyệt"} ·{" "}
              <strong className="text-indigo-700">{currentUser.xp} XP</strong>
            </span>
            <button
              type="button"
              onClick={() => navigate("quiz")}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              Làm bài kiểm tra
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {activeView === "dashboard" && (
            <DashboardView
              currentUser={currentUser}
              results={results}
              lecturesCount={lectures.length}
              documentsCount={documents.length}
              totalStudents={users.filter((u) => u.role === "student").length}
              onNavigate={navigate}
            />
          )}

          {activeView === "lectures" && (
            <LecturesView
              lectures={lectures}
              documents={documents}
              completedLectures={currentUser.completedLectures}
              isTeacher={currentUser.role === "teacher"}
              teacherName={currentUser.name}
              gsUrl={gsUrl}
              onCompleteLecture={handleCompleteLecture}
              onSaveLecture={handleSaveLecture}
              onDeleteLecture={handleDeleteLecture}
              onSaveDocument={handleSaveDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {activeView === "quiz" && (
            <QuizView
              currentUser={currentUser}
              questions={questions}
              gsUrl={gsUrl}
              onReplaceQuestions={setQuestions}
              onSaveQuestion={handleSaveQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onQuizSubmitted={handleQuizSubmitted}
            />
          )}

          {activeView === "game" && (
            <ArenaGameView
              bestScore={currentUser.bestGame}
              onGameFinish={handleGameFinish}
              onGoLeaderboard={() => navigate("leaderboard")}
            />
          )}

          {activeView === "leaderboard" && (
            <LeaderboardView
              users={users}
              currentUsername={currentUser.username}
              gsUrl={gsUrl}
              onSyncStudents={handleSyncUsers}
            />
          )}

          {activeView === "chatbot" && (
            <ChatbotView studentName={currentUser.name} />
          )}

          {activeView === "students" && (
            <StudentsView
              users={users}
              lecturesCount={lectures.length}
              isTeacher={currentUser.role === "teacher"}
              gsUrl={gsUrl}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onSyncUsers={handleSyncUsers}
            />
          )}

          {activeView === "settings" && (
            <SheetSettingsView
              gsUrl={gsUrl}
              users={users}
              lectures={lectures}
              documents={documents}
              questions={questions}
              onSaveGsUrl={setGsUrl}
              onSyncAllData={handleSyncAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
