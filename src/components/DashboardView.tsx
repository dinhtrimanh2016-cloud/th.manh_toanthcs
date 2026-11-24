import React from "react";
import { AppView, QuizResult, UserAccount } from "../types";
import { ArrowRight, BookCheck, ClipboardList, Trophy, Zap } from "lucide-react";

interface DashboardViewProps {
  currentUser: UserAccount;
  results: QuizResult[];
  lecturesCount: number;
  documentsCount: number;
  totalStudents: number;
  onNavigate: (view: AppView) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  results,
  lecturesCount,
  documentsCount,
  totalStudents,
  onNavigate,
}) => {
  const relevantResults =
    currentUser.role === "teacher"
      ? results
      : results.filter((r) => r.username === currentUser.username);

  const avgScore =
    relevantResults.length > 0
      ? (
          relevantResults.reduce((sum, r) => sum + r.score, 0) /
          relevantResults.length
        ).toFixed(1)
      : "--";

  const recentList = [...results].slice(-8).reverse();

  return (
    <div className="space-y-6">
      {/* Primary Action Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-medium text-indigo-300">
            {currentUser.role === "teacher"
              ? `Bảng điều khiển giáo viên · ${totalStudents} học sinh · ${documentsCount} tài liệu PDF`
              : `Học sinh lớp ${currentUser.className} · ${currentUser.gameLevel}`}
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-balance">
            Xin chào, {currentUser.name}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Học bài giảng lý thuyết kèm tài liệu PDF, luyện tập ngân hàng câu hỏi LaTeX đồng bộ Google Sheet hoặc thi đấu tại Đấu trường 60s.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate("quiz")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition whitespace-nowrap shrink-0 cursor-pointer"
          >
            Làm bài kiểm tra
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate("lectures")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition whitespace-nowrap shrink-0 cursor-pointer"
          >
            Bài giảng & Tài liệu PDF
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Điểm kinh nghiệm</span>
            <Trophy className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {currentUser.xp} XP
          </div>
          <p className="text-xs text-slate-500 mt-1">{currentUser.gameLevel}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Bài giảng đã học</span>
            <BookCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {currentUser.completedLectures.length} / {lecturesCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {documentsCount} tài liệu PDF đính kèm
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Điểm TB trắc nghiệm</span>
            <ClipboardList className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {avgScore}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tính trên {relevantResults.length} bài đã nộp
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Kỷ lục Đấu trường 60s</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {currentUser.bestGame} điểm
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Thành tích cao nhất của bạn
          </p>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Lịch sử nộp bài kiểm tra gần đây
            </h3>
            <p className="text-xs text-slate-500">
              Cập nhật tự động sau khi học sinh hoàn thành đề thi
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("quiz")}
            className="text-xs font-semibold text-indigo-600 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Xem danh sách đề thi
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Học sinh</th>
                <th className="px-6 py-3">Đề kiểm tra</th>
                <th className="px-6 py-3 text-right">Số câu đúng</th>
                <th className="px-6 py-3 text-right">Điểm số</th>
                <th className="px-6 py-3 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentList.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-slate-500"
                  >
                    Chưa có bài kiểm tra nào được nộp.
                  </td>
                </tr>
              ) : (
                recentList.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {r.name}{" "}
                      <span className="text-xs font-normal text-slate-500">
                        · {r.className}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">{r.topic}</td>
                    <td className="px-6 py-3.5 text-right tabular-nums text-slate-700">
                      {r.correct}/{r.total}
                    </td>
                    <td className="px-6 py-3.5 text-right tabular-nums font-bold">
                      <span
                        className={
                          r.score >= 8
                            ? "text-emerald-700"
                            : r.score >= 5
                            ? "text-indigo-700"
                            : "text-rose-700"
                        }
                      >
                        {r.score.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right tabular-nums text-xs text-slate-500">
                      {r.time}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
