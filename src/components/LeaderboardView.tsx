import React, { useState } from "react";
import { UserAccount } from "../types";
import { computeGameLevel } from "../data/mathData";
import { fetchLeaderboardFromSheet } from "../utils/googleSheet";
import { Award, Medal, RefreshCw, Trophy } from "lucide-react";

interface LeaderboardViewProps {
  users: UserAccount[];
  currentUsername: string;
  gsUrl: string;
  onSyncStudents: (remoteStudents: UserAccount[]) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  users,
  currentUsername,
  gsUrl,
  onSyncStudents,
}) => {
  const [syncing, setSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const rankedStudents = [...users]
    .filter((u) => u.role === "student")
    .sort((a, b) => b.xp - a.xp || b.bestGame - a.bestGame);

  const handleSync = async () => {
    if (!gsUrl.trim()) {
      setStatusMsg(
        "Chưa cấu hình URL Google Sheet. Đang hiển thị bảng xếp hạng cục bộ."
      );
      return;
    }
    setSyncing(true);
    setStatusMsg("");
    try {
      const students = await fetchLeaderboardFromSheet(gsUrl);
      if (students.length > 0) {
        onSyncStudents(students);
        setStatusMsg(
          `Đã đồng bộ ${students.length} người dùng từ Sheet NguoiDung.`
        );
      } else {
        setStatusMsg('Sheet "NguoiDung" hiện chưa có dữ liệu.');
      }
    } catch (err) {
      setStatusMsg(
        err instanceof Error ? err.message : "Không thể đồng bộ từ Google Sheet."
      );
    } finally {
      setSyncing(false);
    }
  };

  const podiumStyles = [
    {
      label: "Hạng 1",
      bg: "bg-amber-50 border-amber-300",
      icon: <Trophy className="w-6 h-6 text-amber-600" />,
      xpColor: "text-amber-700",
    },
    {
      label: "Hạng 2",
      bg: "bg-slate-100 border-slate-300",
      icon: <Medal className="w-6 h-6 text-slate-600" />,
      xpColor: "text-slate-800",
    },
    {
      label: "Hạng 3",
      bg: "bg-orange-50 border-orange-200",
      icon: <Award className="w-6 h-6 text-orange-600" />,
      xpColor: "text-orange-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Bảng Xếp Hạng Thi Đua Học Tập
          </h3>
          <p className="text-xs text-slate-500">
            Xếp hạng theo tổng điểm XP, cấp độ game và kỷ lục Đấu trường 60s
          </p>
        </div>

        <button
          type="button"
          disabled={syncing}
          onClick={handleSync}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-indigo-600 ${syncing ? "animate-spin" : ""}`}
          />
          {syncing ? "Đang đồng bộ..." : "Đồng bộ từ Sheet NguoiDung"}
        </button>
      </div>

      {statusMsg && (
        <div className="text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl">
          {statusMsg}
        </div>
      )}

      {/* Top 3 Podium */}
      <div className="grid md:grid-cols-3 gap-4">
        {rankedStudents.slice(0, 3).map((s, idx) => {
          const style = podiumStyles[idx];
          return (
            <div
              key={s.username}
              className={`rounded-xl border p-5 flex items-center justify-between gap-4 ${style.bg}`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  {style.icon}
                  <span>{style.label}</span>
                </div>
                <div className="text-base font-bold text-slate-900 truncate">
                  {s.name}
                </div>
                <div className="text-xs text-slate-600 tabular-nums">
                  Lớp {s.className} · {s.gameLevel || computeGameLevel(s.xp)}
                </div>
              </div>
              <div
                className={`text-2xl font-extrabold tabular-nums shrink-0 ${style.xpColor}`}
              >
                {s.xp} <span className="text-xs font-semibold">XP</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Thứ hạng</th>
                <th className="px-6 py-3">Học sinh</th>
                <th className="px-6 py-3">Lớp</th>
                <th className="px-6 py-3">Cấp độ game</th>
                <th className="px-6 py-3 text-right">Kỷ lục Game 60s</th>
                <th className="px-6 py-3 text-right">Tổng XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankedStudents.map((s, idx) => {
                const isMe = s.username === currentUsername;
                return (
                  <tr
                    key={s.username}
                    className={
                      isMe ? "bg-indigo-50/70 font-semibold" : "hover:bg-slate-50"
                    }
                  >
                    <td className="px-6 py-3.5 font-bold text-slate-700 tabular-nums">
                      #{idx + 1}
                    </td>
                    <td className="px-6 py-3.5 text-slate-900">
                      {s.name}
                      {isMe && (
                        <span className="ml-2 text-xs font-semibold text-indigo-600">
                          (Bạn)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{s.className}</td>
                    <td className="px-6 py-3.5 text-xs text-slate-700">
                      {s.gameLevel || computeGameLevel(s.xp)}
                    </td>
                    <td className="px-6 py-3.5 text-right tabular-nums font-semibold text-amber-700">
                      {s.bestGame}
                    </td>
                    <td className="px-6 py-3.5 text-right tabular-nums font-bold text-indigo-700">
                      {s.xp} XP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
