import React, { useEffect, useRef, useState } from "react";
import { ChatMessage } from "../types";
import { solveMathLocally } from "../utils/mathSolver";
import { MathInline, MathText } from "./MathText";
import { Bot, Send, Sparkles, User } from "lucide-react";

interface ChatbotViewProps {
  studentName: string;
}

const QUICK_PROMPTS = [
  "Giải 2x^2 - 5x + 2 = 0",
  "Đạo hàm x^3 - 3x^2 + 5x - 1",
  "Giải 3x - 12 = 0",
  "Tính sqrt(144) + 2^5 - sin(pi/6)",
  "Công thức Vi-ét",
];

export const ChatbotView: React.FC<ChatbotViewProps> = ({ studentName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      source: "local",
      timestamp: "Bây giờ",
      text: [
        `Xin chào **${studentName}**. Tôi là **MathBot**, trợ lý giải Toán học trực tuyến.`,
        "Bạn có thể nhập trực tiếp phương trình, bài toán đạo hàm, biểu thức cần tính hoặc yêu cầu giải thích bài tập tự luận bằng tiếng Việt:",
        "- `Giải 2x^2 - 5x + 2 = 0`",
        "- `Đạo hàm x^3 - 3x^2 + 2x`",
        "- `Công thức Vi-ét` hoặc `Hằng đẳng thức`",
      ].join("\n"),
    },
  ]);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [solverMode, setSolverMode] = useState<"auto" | "local">("auto");
  const [geminiAvailable, setGeminiAvailable] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d: { geminiConfigured?: boolean }) => {
        setGeminiAvailable(Boolean(d.geminiConfigured));
      })
      .catch(() => setGeminiAvailable(false));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const sendPrompt = async (promptText: string) => {
    const clean = promptText.trim();
    if (!clean || isSending) return;

    const now = new Date();
    const timeLabel = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: clean,
      timestamp: timeLabel,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setIsSending(true);

    if (solverMode === "auto" && geminiAvailable) {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: clean,
            history: nextHistory.map((m) => ({ role: m.role, text: m.text })),
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { text: string };
          setMessages((prev) => [
            ...prev,
            {
              id: `a-${Date.now()}`,
              role: "assistant",
              text: data.text,
              source: "gemini",
              timestamp: timeLabel,
            },
          ]);
          setIsSending(false);
          return;
        }
      } catch {
        // Fallback smoothly to local math engine
      }
    }

    const localAnswer = solveMathLocally(clean);
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: localAnswer,
        source: "local",
        timestamp: timeLabel,
      },
    ]);
    setIsSending(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendPrompt(input);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-11rem)] min-h-[520px]">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Trợ lý AI Giải Toán MathBot</h3>
            <p className="text-xs text-slate-300">
              {solverMode === "auto" && geminiAvailable
                ? "Đang dùng Gemini AI kết hợp bộ giải đại số Math.js"
                : "Chế độ giải toán cục bộ tức thì (Math.js + LaTeX)"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setSolverMode("auto")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
              solverMode === "auto"
                ? "bg-indigo-600 text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Thông minh
          </button>
          <button
            type="button"
            onClick={() => setSolverMode("local")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
              solverMode === "local"
                ? "bg-white text-slate-900"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Giải nhanh Offline
          </button>
        </div>
      </div>

      {/* Message List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-4 bg-slate-50"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] lg:max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-sm"
                  : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
              }`}
            >
              {msg.role === "user" ? (
                <MathInline text={msg.text} />
              ) : (
                <MathText text={msg.text} />
              )}
              <div
                className={`text-[11px] mt-1.5 ${
                  msg.role === "user" ? "text-indigo-200" : "text-slate-400"
                }`}
              >
                {msg.role === "assistant"
                  ? `${msg.source === "gemini" ? "Gemini AI" : "Math.js"} · ${msg.timestamp}`
                  : msg.timestamp}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 text-slate-600 px-4 py-3 rounded-2xl rounded-tl-sm text-sm">
              Đang phân tích và trình bày lời giải...
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => void sendPrompt(q)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-xs font-medium text-slate-700 transition whitespace-nowrap shrink-0 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-white border-t border-slate-200 flex items-center gap-3"
      >
        <input
          type="text"
          required
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập bài toán... Ví dụ: Giải x^2 - 4x + 3 = 0 hoặc Đạo hàm sin(2x)"
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={isSending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          Gửi
        </button>
      </form>
    </div>
  );
};
