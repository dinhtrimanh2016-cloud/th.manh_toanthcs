import React, { useEffect, useState } from "react";
import { MathInline } from "./MathText";
import { Play, RotateCcw, Timer, Trophy, Zap } from "lucide-react";

interface ArenaGameViewProps {
  bestScore: number;
  onGameFinish: (score: number, xpEarned: number) => void;
  onGoLeaderboard: () => void;
}

interface QuickMathProblem {
  promptTex: string;
  answer: number;
  options: number[];
}

function generateProblem(): QuickMathProblem {
  const type = Math.floor(Math.random() * 4);
  let promptTex = "";
  let ans = 0;

  if (type === 0) {
    const a = Math.floor(Math.random() * 16) + 4;
    const b = Math.floor(Math.random() * 11) + 3;
    const c = Math.floor(Math.random() * 20) + 1;
    promptTex = `$${a} \\times ${b} + ${c} = ?$`;
    ans = a * b + c;
  } else if (type === 1) {
    const x = Math.floor(Math.random() * 13) - 4;
    const a = Math.floor(Math.random() * 6) + 2;
    const b = Math.floor(Math.random() * 14) - 6;
    const c = a * x + b;
    promptTex = `$${a}x ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`} = ${c} \\Rightarrow x = ?$`;
    ans = x;
  } else if (type === 2) {
    const k = Math.floor(Math.random() * 4) + 1;
    const x0 = Math.floor(Math.random() * 5) + 1;
    promptTex = `$f(x) = ${k}x^2 \\Rightarrow f'(${x0}) = ?$`;
    ans = 2 * k * x0;
  } else {
    const base = Math.floor(Math.random() * 10) + 4;
    const p = Math.floor(Math.random() * 4) + 2;
    promptTex = `$\\sqrt{${base * base}} + ${p}^2 = ?$`;
    ans = base + p * p;
  }

  const opts = new Set<number>([ans]);
  while (opts.size < 4) {
    const delta = (Math.floor(Math.random() * 7) + 1) * (Math.random() < 0.5 ? 1 : -1);
    opts.add(ans + delta);
  }
  return {
    promptTex,
    answer: ans,
    options: [...opts].sort(() => Math.random() - 0.5),
  };
}

function playFeedbackTone(correct: boolean) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = correct ? 660 : 220;
    gain.gain.value = 0.06;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (correct ? 0.08 : 0.14));
  } catch {
    // Ignore audio context restriction
  }
}

export const ArenaGameView: React.FC<ArenaGameViewProps> = ({
  bestScore,
  onGameFinish,
  onGoLeaderboard,
}) => {
  const [phase, setPhase] = useState<"ready" | "playing" | "over">("ready");
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [solvedCount, setSolvedCount] = useState(0);
  const [problem, setProblem] = useState<QuickMathProblem>(() => generateProblem());
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "playing" && secondsLeft === 0) {
      const gained = Math.round(score / 2);
      setXpEarned(gained);
      setPhase("over");
      onGameFinish(score, gained);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase]);

  const startGame = () => {
    setScore(0);
    setCombo(1);
    setSolvedCount(0);
    setSecondsLeft(60);
    setProblem(generateProblem());
    setPhase("playing");
  };

  const handleOptionClick = (val: number) => {
    if (val === problem.answer) {
      playFeedbackTone(true);
      setScore((s) => s + 10 * combo);
      setCombo((c) => Math.min(3, c + 1));
      setSolvedCount((n) => n + 1);
    } else {
      playFeedbackTone(false);
      setCombo(1);
    }
    setProblem(generateProblem());
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 text-white p-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Đấu trường Toán học 60s
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Trả lời đúng liên tiếp để nhân hệ số Combo x2, x3
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Kỷ lục cá nhân</div>
          <div className="text-xl font-bold text-amber-400 tabular-nums">
            {bestScore} điểm
          </div>
        </div>
      </div>

      {phase === "ready" && (
        <div className="p-8 lg:p-12 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Zap className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h4 className="text-xl font-bold text-slate-900">
              Thử thách phản xạ Toán học trong 60 giây
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Giải nhanh các phép tính, phương trình bậc nhất, đạo hàm tại điểm và căn bậc hai. Mỗi câu đúng cộng 10 điểm nhân theo hệ số Combo.
            </p>
          </div>
          <button
            type="button"
            onClick={startGame}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition cursor-pointer"
          >
            <Play className="w-4 h-4" />
            Bắt đầu thử thách
          </button>
        </div>
      )}

      {phase === "playing" && (
        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-xl">
            <div className="flex items-center gap-5">
              <div>
                <div className="text-xs text-slate-500">Điểm hiện tại</div>
                <div className="text-2xl font-bold text-indigo-600 tabular-nums">
                  {score}
                </div>
              </div>
              <div className="px-3 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold tabular-nums">
                Combo x{combo}
              </div>
            </div>

            <div className="inline-flex items-center gap-2 text-rose-600 font-mono text-2xl font-bold tabular-nums">
              <Timer className="w-5 h-5" />
              {secondsLeft}s
            </div>
          </div>

          <div className="py-8 text-center space-y-2">
            <div className="text-xs font-medium text-slate-500">
              Chọn đáp án chính xác
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-slate-900">
              <MathInline text={problem.promptTex} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {problem.options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleOptionClick(opt)}
                className="py-4 px-4 rounded-xl bg-white hover:bg-indigo-600 hover:text-white border border-slate-300 font-bold text-xl tabular-nums transition active:scale-95 cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "over" && (
        <div className="p-8 lg:p-10 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Trophy className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-slate-900">Hết giờ!</h4>
            <p className="text-sm text-slate-600 tabular-nums">
              Bạn trả lời đúng {solvedCount} câu và đạt{" "}
              <strong className="text-indigo-600 text-base">{score} điểm</strong>
              .
            </p>
            <p className="text-xs font-semibold text-emerald-700 tabular-nums">
              Cộng +{xpEarned} XP vào hồ sơ học tập
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={startGame}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Chơi lại
            </button>
            <button
              type="button"
              onClick={onGoLeaderboard}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              Xem Bảng xếp hạng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
