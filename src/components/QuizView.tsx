import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  QuestionType,
  QuizBank,
  QuizQuestion,
  QuizResult,
  UserAccount,
} from "../types";
import { buildQuizBanksFromQuestions } from "../data/mathData";
import { fetchQuestionsFromSheet, postToGoogleSheet } from "../utils/googleSheet";
import { MathInline, MathText } from "./MathText";
import {
  ActiveEditableField,
  insertLatexSnippetIntoField,
  KatexLivePreviewWindow,
  LatexSnippetToolbar,
} from "./LatexPreviewStudio";
import {
  Award,
  CheckCircle2,
  Clock,
  CloudDownload,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Send,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

interface QuizViewProps {
  currentUser: UserAccount;
  questions: QuizQuestion[];
  gsUrl: string;
  onReplaceQuestions: (questions: QuizQuestion[]) => void;
  onSaveQuestion: (question: QuizQuestion) => void;
  onDeleteQuestion: (id: string) => void;
  onQuizSubmitted: (record: QuizResult, xpEarned: number) => void;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export const QuizView: React.FC<QuizViewProps> = ({
  currentUser,
  questions,
  gsUrl,
  onReplaceQuestions,
  onSaveQuestion,
  onDeleteQuestion,
  onQuizSubmitted,
}) => {
  const isTeacher = currentUser.role === "teacher";
  const quizBanks = useMemo(
    () => buildQuizBanksFromQuestions(questions),
    [questions]
  );

  const [subTab, setSubTab] = useState<"test" | "bank">("test");
  const [stage, setStage] = useState<"lobby" | "running" | "result">("lobby");
  const [activeQuiz, setActiveQuiz] = useState<QuizBank | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [mcAnswers, setMcAnswers] = useState<Array<number | null>>([]);
  const [essayAnswers, setEssayAnswers] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [syncMessage, setSyncMessage] = useState("");
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [lastResult, setLastResult] = useState<{
    score: number;
    correct: number;
    total: number;
    xpEarned: number;
  } | null>(null);

  // Question Bank Filter & Editor Modal
  const [bankTopicFilter, setBankTopicFilter] = useState("all");
  const [bankTypeFilter, setBankTypeFilter] = useState<"all" | QuestionType>("all");
  const [qModalOpen, setQModalOpen] = useState(false);
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [qTopic, setQTopic] = useState("Đề 1: Đạo hàm & Khảo sát hàm số");
  const [qType, setQType] = useState<QuestionType>("trac_nghiem");
  const [qPrompt, setQPrompt] = useState("");
  const [qOptA, setQOptA] = useState("");
  const [qOptB, setQOptB] = useState("");
  const [qOptC, setQOptC] = useState("");
  const [qOptD, setQOptD] = useState("");
  const [qCorrectIdx, setQCorrectIdx] = useState(0);
  const [qEssayAns, setQEssayAns] = useState("");
  const [qExplain, setQExplain] = useState("");
  const [showQPreview, setShowQPreview] = useState(true);

  type QuestionFieldKey =
    | "prompt"
    | "optA"
    | "optB"
    | "optC"
    | "optD"
    | "essay"
    | "explain";
  const [activeQFieldKey, setActiveQFieldKey] =
    useState<QuestionFieldKey>("prompt");

  const qPromptRef = useRef<HTMLTextAreaElement | null>(null);
  const qOptARef = useRef<HTMLInputElement | null>(null);
  const qOptBRef = useRef<HTMLInputElement | null>(null);
  const qOptCRef = useRef<HTMLInputElement | null>(null);
  const qOptDRef = useRef<HTMLInputElement | null>(null);
  const qEssayRef = useRef<HTMLInputElement | null>(null);
  const qExplainRef = useRef<HTMLTextAreaElement | null>(null);

  const getActiveQuestionField = (): ActiveEditableField | null => {
    switch (activeQFieldKey) {
      case "prompt":
        return qPromptRef.current
          ? {
              element: qPromptRef.current,
              value: qPrompt,
              onChange: setQPrompt,
              label: "Đề bài",
            }
          : null;
      case "optA":
        return qOptARef.current
          ? {
              element: qOptARef.current,
              value: qOptA,
              onChange: setQOptA,
              label: "Đáp án A",
            }
          : null;
      case "optB":
        return qOptBRef.current
          ? {
              element: qOptBRef.current,
              value: qOptB,
              onChange: setQOptB,
              label: "Đáp án B",
            }
          : null;
      case "optC":
        return qOptCRef.current
          ? {
              element: qOptCRef.current,
              value: qOptC,
              onChange: setQOptC,
              label: "Đáp án C",
            }
          : null;
      case "optD":
        return qOptDRef.current
          ? {
              element: qOptDRef.current,
              value: qOptD,
              onChange: setQOptD,
              label: "Đáp án D",
            }
          : null;
      case "essay":
        return qEssayRef.current
          ? {
              element: qEssayRef.current,
              value: qEssayAns,
              onChange: setQEssayAns,
              label: "Đáp án tự luận",
            }
          : null;
      case "explain":
        return qExplainRef.current
          ? {
              element: qExplainRef.current,
              value: qExplain,
              onChange: setQExplain,
              label: "Lời giải chi tiết",
            }
          : null;
    }
  };

  const activeQFieldLabel: Record<QuestionFieldKey, string> = {
    prompt: "Đề bài",
    optA: "Đáp án A",
    optB: "Đáp án B",
    optC: "Đáp án C",
    optD: "Đáp án D",
    essay: "Đáp án tự luận",
    explain: "Lời giải chi tiết",
  };

  useEffect(() => {
    if (stage !== "running") return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          void handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, activeQuiz]);

  const startQuiz = (bank: QuizBank) => {
    setActiveQuiz(bank);
    setQuestionIdx(0);
    setMcAnswers(new Array(bank.questions.length).fill(null));
    setEssayAnswers(new Array(bank.questions.length).fill(""));
    setSecondsLeft(bank.timeMinutes * 60);
    setSyncMessage("");
    setStage("running");
  };

  const handleSyncQuestions = async () => {
    if (!gsUrl.trim()) {
      setSyncMessage(
        "Chưa cấu hình URL Google Sheet. Vui lòng vào mục Kết nối Google Sheet để dán URL Web App."
      );
      return;
    }
    setLoadingSheet(true);
    setSyncMessage("");
    try {
      const remoteQs = await fetchQuestionsFromSheet(gsUrl);
      if (remoteQs.length === 0) {
        setSyncMessage('Sheet "CauHoi" hiện chưa có câu hỏi nào.');
      } else {
        onReplaceQuestions(remoteQs);
        setSyncMessage(
          `Đã đồng bộ thành công ${remoteQs.length} câu hỏi từ Sheet CauHoi.`
        );
      }
    } catch (err) {
      setSyncMessage(
        err instanceof Error ? err.message : "Không thể tải câu hỏi từ Google Sheet."
      );
    } finally {
      setLoadingSheet(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeQuiz) return;

    let correct = 0;
    activeQuiz.questions.forEach((q, i) => {
      if (q.type === "trac_nghiem") {
        if (mcAnswers[i] === q.answer) correct++;
      } else {
        const userStr = (essayAnswers[i] || "").trim().toLowerCase();
        const targetStr = (q.essayAnswer || "").trim().toLowerCase();
        if (userStr && targetStr && userStr === targetStr) {
          correct++;
        } else if (userStr.length > 0 && !targetStr) {
          correct++;
        }
      }
    });

    const total = activeQuiz.questions.length;
    const score = Number(((correct / total) * 10).toFixed(1));
    const xpEarned = correct * 25 + (score >= 8 ? 30 : 0);

    const now = new Date();
    const timeStr = `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const record: QuizResult = {
      id: `res-${Date.now()}`,
      username: currentUser.username,
      name: currentUser.name,
      className: currentUser.className,
      topic: activeQuiz.title,
      correct,
      total,
      score,
      time: timeStr,
      syncedToSheet: false,
    };

    setLastResult({ score, correct, total, xpEarned });
    setStage("result");

    if (gsUrl.trim()) {
      setSyncMessage("Đang đồng bộ kết quả lên Google Sheet...");
      const res = await postToGoogleSheet(gsUrl, {
        action: "submitQuiz",
        record,
        xp: currentUser.xp + xpEarned,
      });
      record.syncedToSheet = res.ok;
      setSyncMessage(
        res.ok
          ? "Đã lưu điểm số thành công lên Google Sheet."
          : "Không thể kết nối Google Sheet, kết quả đã được lưu cục bộ."
      );
    } else {
      setSyncMessage(
        "Chế độ Demo: Kết quả đã lưu trên trình duyệt (chưa gắn URL Google Sheet)."
      );
    }

    onQuizSubmitted(record, xpEarned);
  };

  const formatTimer = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // Bank Editor Functions
  const topics = useMemo(() => {
    const set = new Set(questions.map((q) => q.topic));
    return ["all", ...Array.from(set)];
  }, [questions]);

  const filteredBankQuestions = useMemo(() => {
    return questions.filter((q) => {
      const mTopic = bankTopicFilter === "all" || q.topic === bankTopicFilter;
      const mType = bankTypeFilter === "all" || q.type === bankTypeFilter;
      return mTopic && mType;
    });
  }, [questions, bankTopicFilter, bankTypeFilter]);

  const openNewQuestionModal = () => {
    setEditingQId(null);
    setQTopic(topics[1] || "Đề 1: Đạo hàm & Khảo sát hàm số");
    setQType("trac_nghiem");
    setQPrompt("Tính đạo hàm của hàm số $y = x^2 + 3x$?");
    setQOptA("$y' = 2x + 3$");
    setQOptB("$y' = x + 3$");
    setQOptC("$y' = 2x$");
    setQOptD("$y' = 3x + 2$");
    setQCorrectIdx(0);
    setQEssayAns("");
    setQExplain("Áp dụng công thức $(x^n)' = n x^{n-1} \\Rightarrow y' = 2x + 3$.");
    setQModalOpen(true);
  };

  const openEditQuestionModal = (q: QuizQuestion) => {
    setEditingQId(q.id);
    setQTopic(q.topic);
    setQType(q.type);
    setQPrompt(q.q);
    setQOptA(q.options[0] || "");
    setQOptB(q.options[1] || "");
    setQOptC(q.options[2] || "");
    setQOptD(q.options[3] || "");
    setQCorrectIdx(q.answer || 0);
    setQEssayAns(q.essayAnswer || "");
    setQExplain(q.explain);
    setQModalOpen(true);
  };

  const handleSaveQuestionForm = (e: React.FormEvent) => {
    e.preventDefault();
    const newQ: QuizQuestion = {
      id: editingQId || `q-${Date.now()}`,
      topic: qTopic.trim() || "Đề tổng hợp",
      type: qType,
      q: qPrompt.trim(),
      options: qType === "trac_nghiem" ? [qOptA, qOptB, qOptC, qOptD] : [],
      answer: qType === "trac_nghiem" ? qCorrectIdx : 0,
      essayAnswer: qType === "tu_luan" ? qEssayAns.trim() : "",
      explain: qExplain.trim(),
    };
    onSaveQuestion(newQ);
    setQModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Sub-tabs (Only shown when not actively inside a timed test) */}
      {stage === "lobby" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setSubTab("test")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                subTab === "test"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Làm bài kiểm tra ({quizBanks.length} đề)
            </button>
            <button
              type="button"
              onClick={() => setSubTab("bank")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                subTab === "bank"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Ngân hàng câu hỏi CauHoi ({questions.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={loadingSheet}
              onClick={handleSyncQuestions}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              <CloudDownload className="w-4 h-4" />
              {loadingSheet ? "Đang tải..." : "Tải đề từ Sheet CauHoi"}
            </button>

            {isTeacher && subTab === "bank" && (
              <button
                type="button"
                onClick={openNewQuestionModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Thêm câu hỏi LaTeX
              </button>
            )}
          </div>
        </div>
      )}

      {syncMessage && (
        <div className="text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700 px-4 py-3 rounded-xl">
          {syncMessage}
        </div>
      )}

      {/* SUB-TAB 1: LOBBY / TEST RUNNER / RESULT */}
      {subTab === "test" && stage === "lobby" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizBanks.map((bank) => (
            <div
              key={bank.id}
              className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-500">
                  {bank.category} · {bank.level} · {bank.timeMinutes} phút
                </div>
                <h4 className="text-base font-bold text-slate-900">{bank.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {bank.questions.length} câu hỏi Toán học (hỗ trợ công thức LaTeX & lời giải chi tiết).
                </p>
              </div>
              <button
                type="button"
                onClick={() => startQuiz(bank)}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition cursor-pointer"
              >
                Bắt đầu làm bài
              </button>
            </div>
          ))}
        </div>
      )}

      {stage === "running" && activeQuiz && (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="text-xs font-semibold text-indigo-600">
                  {activeQuiz.title} ·{" "}
                  {activeQuiz.questions[questionIdx].type === "tu_luan"
                    ? "Tự luận"
                    : "Trắc nghiệm"}
                </div>
                <h3 className="text-lg font-bold text-slate-900 tabular-nums">
                  Câu {questionIdx + 1} / {activeQuiz.questions.length}
                </h3>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-mono text-sm font-bold tabular-nums">
                <Clock className="w-4 h-4" />
                {formatTimer(secondsLeft)}
              </div>
            </div>

            <div className="text-base lg:text-lg font-medium text-slate-900">
              <MathText text={activeQuiz.questions[questionIdx].q} />
            </div>

            {activeQuiz.questions[questionIdx].type === "trac_nghiem" ? (
              <div className="space-y-3">
                {activeQuiz.questions[questionIdx].options.map((opt, idx) => {
                  const selected = mcAnswers[questionIdx] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const next = [...mcAnswers];
                        next[questionIdx] = idx;
                        setMcAnswers(next);
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition flex items-center gap-3.5 cursor-pointer ${
                        selected
                          ? "bg-indigo-50 border-indigo-600"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                          selected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {OPTION_LABELS[idx]}
                      </span>
                      <span className="text-sm lg:text-base text-slate-900">
                        <MathInline text={opt} />
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Nhập đáp án / bài làm tự luận của bạn:
                </label>
                <textarea
                  rows={4}
                  value={essayAnswers[questionIdx] || ""}
                  onChange={(e) => {
                    const next = [...essayAnswers];
                    next[questionIdx] = e.target.value;
                    setEssayAnswers(next);
                  }}
                  placeholder="Ví dụ: m = 2 hoặc m = -2 (Trình bày kết quả cuối cùng hoặc các bước giải)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-5 border-t border-slate-200">
              <button
                type="button"
                disabled={questionIdx === 0}
                onClick={() => setQuestionIdx((i) => Math.max(0, i - 1))}
                className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Câu trước
              </button>
              {questionIdx < activeQuiz.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setQuestionIdx((i) =>
                      Math.min(activeQuiz.questions.length - 1, i + 1)
                    )
                  }
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold cursor-pointer"
                >
                  Câu tiếp theo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer"
                >
                  Nộp bài ngay
                </button>
              )}
            </div>
          </div>

          {/* Question Palette */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Danh sách câu hỏi</h4>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                Chọn ô số để chuyển nhanh giữa các câu
              </p>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {activeQuiz.questions.map((q, i) => {
                const answered =
                  q.type === "trac_nghiem"
                    ? mcAnswers[i] !== null
                    : Boolean((essayAnswers[i] || "").trim());
                const isCurrent = i === questionIdx;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setQuestionIdx(i)}
                    className={`h-9 rounded-lg text-xs font-bold tabular-nums transition cursor-pointer ${
                      isCurrent ? "ring-2 ring-indigo-600 ring-offset-1 " : ""
                    }${
                      answered
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => void handleSubmit()}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Nộp bài & Lưu điểm
              </button>
              <button
                type="button"
                onClick={() => setStage("lobby")}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Hủy bài làm
              </button>
            </div>
          </div>
        </div>
      )}

      {stage === "result" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                Hoàn thành bài kiểm tra
              </h3>
              {syncMessage && (
                <p className="text-xs font-medium text-emerald-700 mt-1">
                  {syncMessage}
                </p>
              )}
            </div>

            {lastResult && (
              <div className="flex flex-wrap justify-center gap-8 py-4 border-y border-slate-100">
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    Điểm số (Hệ 10)
                  </div>
                  <div className="text-3xl font-extrabold text-indigo-600 tabular-nums mt-1">
                    {lastResult.score.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    Số câu đúng
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-600 tabular-nums mt-1">
                    {lastResult.correct}/{lastResult.total}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    XP nhận được
                  </div>
                  <div className="text-3xl font-extrabold text-amber-600 tabular-nums mt-1">
                    +{lastResult.xpEarned}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setStage("lobby")}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition cursor-pointer"
            >
              Quay lại danh sách đề thi
            </button>
          </div>

          {activeQuiz && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-8 space-y-4">
              <h4 className="text-base font-bold text-slate-900">
                Đáp án & Lời giải chi tiết
              </h4>
              <div className="space-y-4">
                {activeQuiz.questions.map((q, idx) => {
                  const isMc = q.type === "trac_nghiem";
                  const userAns = mcAnswers[idx];
                  const essayVal = (essayAnswers[idx] || "").trim();
                  const isRight = isMc
                    ? userAns === q.answer
                    : essayVal.toLowerCase() === (q.essayAnswer || "").toLowerCase();

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border space-y-2 ${
                        isRight
                          ? "bg-emerald-50/40 border-emerald-200"
                          : "bg-rose-50/40 border-rose-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-900">
                          Câu {idx + 1}: <MathInline text={q.q} />
                        </div>
                        {isRight ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 whitespace-nowrap shrink-0">
                            <CheckCircle2 className="w-4 h-4" /> Đúng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 whitespace-nowrap shrink-0">
                            <XCircle className="w-4 h-4" /> Cần xem lại
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-700 space-y-1">
                        {isMc ? (
                          <>
                            <div>
                              Bạn chọn:{" "}
                              <strong>
                                {userAns !== null ? (
                                  <>
                                    {OPTION_LABELS[userAns]}.{" "}
                                    <MathInline text={q.options[userAns]} />
                                  </>
                                ) : (
                                  "Chưa trả lời"
                                )}
                              </strong>
                            </div>
                            {!isRight && (
                              <div className="text-emerald-800">
                                Đáp án đúng:{" "}
                                <strong>
                                  {OPTION_LABELS[q.answer]}.{" "}
                                  <MathInline text={q.options[q.answer]} />
                                </strong>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div>
                              Bài làm của bạn:{" "}
                              <strong>{essayVal || "Chưa nhập đáp án"}</strong>
                            </div>
                            {q.essayAnswer && (
                              <div className="text-emerald-800">
                                Đáp án chuẩn: <strong>{q.essayAnswer}</strong>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-3">
                        <span className="font-semibold text-slate-900">
                          Lời giải chi tiết:{" "}
                        </span>
                        <MathInline text={q.explain} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: NGÂN HÀNG CÂU HỎI CAUHOI */}
      {subTab === "bank" && stage === "lobby" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={bankTopicFilter}
              onChange={(e) => setBankTopicFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700"
            >
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "Tất cả chủ đề / đề thi" : t}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
              <button
                type="button"
                onClick={() => setBankTypeFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  bankTypeFilter === "all"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setBankTypeFilter("trac_nghiem")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  bankTypeFilter === "trac_nghiem"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                Trắc nghiệm
              </button>
              <button
                type="button"
                onClick={() => setBankTypeFilter("tu_luan")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  bankTypeFilter === "tu_luan"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                Tự luận
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredBankQuestions.map((q, i) => (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500">
                      Câu #{i + 1} · {q.topic} ·{" "}
                      {q.type === "tu_luan" ? "Tự luận" : "Trắc nghiệm"}
                    </div>
                    <div className="text-sm lg:text-base font-semibold text-slate-900">
                      <MathText text={q.q} />
                    </div>
                  </div>

                  {isTeacher && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditQuestionModal(q)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 cursor-pointer"
                        title="Sửa câu hỏi"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        title="Xóa câu hỏi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {q.type === "trac_nghiem" && (
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`px-3 py-2 rounded-lg border ${
                          oIdx === q.answer
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        {OPTION_LABELS[oIdx]}. <MathInline text={opt} />
                      </div>
                    ))}
                  </div>
                )}

                {q.type === "tu_luan" && q.essayAnswer && (
                  <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                    Đáp án tự luận: <MathInline text={q.essayAnswer} />
                  </div>
                )}

                <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="font-semibold text-slate-900">Lời giải: </span>
                  <MathInline text={q.explain} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: THÊM / SỬA CÂU HỎI LATEX + LIVE PREVIEW KATEX */}
      {qModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className={`bg-white rounded-2xl border border-slate-200 w-full ${
              showQPreview ? "max-w-6xl" : "max-w-3xl"
            } max-h-[92vh] flex flex-col overflow-hidden shadow-2xl transition-all`}
          >
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 truncate">
                  {editingQId
                    ? "Chỉnh sửa câu hỏi (Sheet CauHoi)"
                    : "Soạn thảo câu hỏi Toán học (Sheet CauHoi)"}
                </h4>
                <p className="text-xs text-slate-500 truncate">
                  Xem trước đề bài, các đáp án A/B/C/D và lời giải qua KaTeX ngay lúc nhập
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowQPreview((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                    showQPreview
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {showQPreview ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      Ẩn Live Preview
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      Mở Live Preview
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setQModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSaveQuestionForm}
              className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5"
            >
              <div
                className={`grid gap-6 items-start ${
                  showQPreview ? "lg:grid-cols-12" : "grid-cols-1"
                }`}
              >
                {/* Left Column: Question Authoring Inputs */}
                <div
                  className={`space-y-4 ${
                    showQPreview ? "lg:col-span-7" : ""
                  }`}
                >
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Chủ đề / Tên đề thi
                      </label>
                      <input
                        type="text"
                        required
                        value={qTopic}
                        onChange={(e) => setQTopic(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Loại câu hỏi
                      </label>
                      <select
                        value={qType}
                        onChange={(e) =>
                          setQType(e.target.value as QuestionType)
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                      >
                        <option value="trac_nghiem">
                          Trắc nghiệm (A, B, C, D)
                        </option>
                        <option value="tu_luan">Tự luận</option>
                      </select>
                    </div>
                  </div>

                  <LatexSnippetToolbar
                    activeFieldLabel={activeQFieldLabel[activeQFieldKey]}
                    onInsert={(snippet) =>
                      insertLatexSnippetIntoField(
                        getActiveQuestionField(),
                        snippet
                      )
                    }
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Đề bài (hỗ trợ $...$ và $$...$$)
                    </label>
                    <textarea
                      ref={qPromptRef}
                      rows={4}
                      required
                      value={qPrompt}
                      onFocus={() => setActiveQFieldKey("prompt")}
                      onChange={(e) => setQPrompt(e.target.value)}
                      placeholder="Nhập đề bài Toán học..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {qType === "trac_nghiem" ? (
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Đáp án A (hỗ trợ $LaTeX$)
                          </label>
                          <input
                            ref={qOptARef}
                            type="text"
                            required
                            value={qOptA}
                            onFocus={() => setActiveQFieldKey("optA")}
                            onChange={(e) => setQOptA(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Đáp án B (hỗ trợ $LaTeX$)
                          </label>
                          <input
                            ref={qOptBRef}
                            type="text"
                            required
                            value={qOptB}
                            onFocus={() => setActiveQFieldKey("optB")}
                            onChange={(e) => setQOptB(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Đáp án C (hỗ trợ $LaTeX$)
                          </label>
                          <input
                            ref={qOptCRef}
                            type="text"
                            required
                            value={qOptC}
                            onFocus={() => setActiveQFieldKey("optC")}
                            onChange={(e) => setQOptC(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Đáp án D (hỗ trợ $LaTeX$)
                          </label>
                          <input
                            ref={qOptDRef}
                            type="text"
                            required
                            value={qOptD}
                            onFocus={() => setActiveQFieldKey("optD")}
                            onChange={(e) => setQOptD(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Đáp án đúng
                        </label>
                        <select
                          value={qCorrectIdx}
                          onChange={(e) =>
                            setQCorrectIdx(Number(e.target.value))
                          }
                          className="px-4 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                        >
                          <option value={0}>Đáp án A</option>
                          <option value={1}>Đáp án B</option>
                          <option value={2}>Đáp án C</option>
                          <option value={3}>Đáp án D</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Đáp án tự luận chuẩn (hỗ trợ $LaTeX$)
                      </label>
                      <input
                        ref={qEssayRef}
                        type="text"
                        value={qEssayAns}
                        onFocus={() => setActiveQFieldKey("essay")}
                        onChange={(e) => setQEssayAns(e.target.value)}
                        placeholder="Ví dụ: $m = 2$ hoặc $m = -2$"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Lời giải chi tiết (hỗ trợ $...$ và $$...$$)
                    </label>
                    <textarea
                      ref={qExplainRef}
                      rows={4}
                      required
                      value={qExplain}
                      onFocus={() => setActiveQFieldKey("explain")}
                      onChange={(e) => setQExplain(e.target.value)}
                      placeholder="Trình bày hướng dẫn giải chi tiết..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Right Column: Live KaTeX Preview Window */}
                {showQPreview && (
                  <div className="lg:col-span-5 lg:sticky lg:top-0">
                    <KatexLivePreviewWindow
                      title="Cửa sổ Live Preview · Câu hỏi"
                      textsToValidate={
                        qType === "trac_nghiem"
                          ? [qPrompt, qOptA, qOptB, qOptC, qOptD, qExplain]
                          : [qPrompt, qEssayAns, qExplain]
                      }
                      activeEditingHint={activeQFieldLabel[activeQFieldKey]}
                    >
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                        <div className="space-y-1 pb-3 border-b border-slate-100">
                          <div className="text-xs font-medium text-slate-500">
                            {qTopic || "Chủ đề câu hỏi"} ·{" "}
                            {qType === "tu_luan" ? "Tự luận" : "Trắc nghiệm"}
                          </div>
                          <div className="font-semibold text-slate-900">
                            {qPrompt.trim() ? (
                              <MathText text={qPrompt} />
                            ) : (
                              <span className="text-slate-400 font-normal text-xs">
                                Đề bài sẽ hiển thị tại đây...
                              </span>
                            )}
                          </div>
                        </div>

                        {qType === "trac_nghiem" ? (
                          <div className="space-y-2">
                            {[qOptA, qOptB, qOptC, qOptD].map((opt, idx) => {
                              const isRight = idx === qCorrectIdx;
                              return (
                                <div
                                  key={idx}
                                  className={`px-3 py-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                                    isRight
                                      ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                                      : "bg-slate-50 border-slate-200 text-slate-800"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span
                                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                                        isRight
                                          ? "bg-emerald-600 text-white"
                                          : "bg-slate-200 text-slate-700"
                                      }`}
                                    >
                                      {OPTION_LABELS[idx]}
                                    </span>
                                    <span className="min-w-0 break-words">
                                      {opt.trim() ? (
                                        <MathInline text={opt} />
                                      ) : (
                                        <span className="text-slate-400 text-xs">
                                          Chưa nhập đáp án {OPTION_LABELS[idx]}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                  {isRight && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 whitespace-nowrap shrink-0">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Đáp án đúng
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-900">
                            <span className="font-semibold">
                              Đáp án chuẩn:{" "}
                            </span>
                            {qEssayAns.trim() ? (
                              <MathInline text={qEssayAns} />
                            ) : (
                              <span className="text-emerald-700/70 italic">
                                Chưa nhập đáp án tự luận
                              </span>
                            )}
                          </div>
                        )}

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1">
                          <div className="text-xs font-bold text-slate-900">
                            Lời giải chi tiết
                          </div>
                          <div className="text-slate-700">
                            {qExplain.trim() ? (
                              <MathText text={qExplain} />
                            ) : (
                              <span className="text-slate-400 text-xs italic">
                                Lời giải chi tiết sẽ hiển thị tại đây...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </KatexLivePreviewWindow>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setQModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold cursor-pointer"
                >
                  Lưu câu hỏi lên Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
