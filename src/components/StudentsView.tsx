import React, { useMemo, useState } from "react";
import { UserAccount } from "../types";
import { computeGameLevel } from "../data/mathData";
import { fetchLeaderboardFromSheet } from "../utils/googleSheet";
import { Pencil, RefreshCw, Search, Trash2, UserPlus, X } from "lucide-react";

interface StudentsViewProps {
  users: UserAccount[];
  lecturesCount: number;
  isTeacher: boolean;
  gsUrl: string;
  onAddStudent: (student: UserAccount) => void;
  onUpdateStudent: (username: string, updates: Partial<UserAccount>) => void;
  onDeleteStudent: (username: string) => void;
  onSyncUsers: (remoteUsers: UserAccount[]) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  users,
  lecturesCount,
  isTeacher,
  gsUrl,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onSyncUsers,
}) => {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  const [formUsername, setFormUsername] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formClass, setFormClass] = useState("");
  const [formPass, setFormPass] = useState("123456");
  const [formXp, setFormXp] = useState(0);
  const [formError, setFormError] = useState("");

  const students = useMemo(
    () => users.filter((u) => u.role === "student"),
    [users]
  );

  const classes = useMemo(() => {
    const set = new Set(students.map((s) => s.className).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [students]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      const matchClass = classFilter === "all" || s.className === classFilter;
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q);
      return matchClass && matchSearch;
    });
  }, [students, search, classFilter]);

  const handleSyncSheet = async () => {
    if (!gsUrl.trim()) {
      setSyncMsg("Chưa cấu hình URL Google Sheet trong mục Kết nối Google Sheet.");
      return;
    }
    setSyncing(true);
    setSyncMsg("");
    try {
      const remote = await fetchLeaderboardFromSheet(gsUrl);
      if (remote.length > 0) {
        onSyncUsers(remote);
        setSyncMsg(`Đã đồng bộ ${remote.length} tài khoản từ Sheet NguoiDung.`);
      } else {
        setSyncMsg('Sheet "NguoiDung" hiện chưa có dữ liệu.');
      }
    } catch (err) {
      setSyncMsg(err instanceof Error ? err.message : "Lỗi đồng bộ Sheet NguoiDung.");
    } finally {
      setSyncing(false);
    }
  };

  const openAddModal = () => {
    setFormUsername("");
    setFormName("");
    setFormEmail("");
    setFormClass("12A1");
    setFormPass("123456");
    setFormXp(0);
    setFormError("");
    setModalMode("add");
  };

  const openEditModal = (st: UserAccount) => {
    setFormUsername(st.username);
    setFormName(st.name);
    setFormEmail(st.email || "");
    setFormClass(st.className);
    setFormPass(st.password);
    setFormXp(st.xp);
    setFormError("");
    setModalMode("edit");
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const u = formUsername.trim();
    const n = formName.trim();
    const em = formEmail.trim();
    const c = formClass.trim();
    if (!u || !n || !em || !c || !formPass) {
      setFormError("Vui lòng nhập đầy đủ các trường thông tin.");
      return;
    }

    if (modalMode === "add") {
      if (users.some((x) => x.username.toLowerCase() === u.toLowerCase())) {
        setFormError("Mã học sinh này đã tồn tại trong hệ thống.");
        return;
      }
      onAddStudent({
        username: u,
        email: em,
        password: formPass,
        name: n,
        role: "student",
        className: c,
        xp: formXp,
        bestGame: 0,
        gameLevel: computeGameLevel(formXp),
        completedLectures: [],
      });
    } else if (modalMode === "edit") {
      onUpdateStudent(u, {
        name: n,
        email: em,
        className: c,
        password: formPass,
        xp: formXp,
        gameLevel: computeGameLevel(formXp),
      });
    }
    setModalMode(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Danh sách Học sinh (Sheet NguoiDung)
          </h3>
          <p className="text-xs text-slate-500">
            {isTeacher
              ? "Lưu trữ thông tin tên, email, mật khẩu/ID, điểm số và cấp độ game đồng bộ với Google Sheet"
              : "Danh sách thành viên đang tham gia học tập trong hệ thống"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên, email hoặc mã HS..."
              className="pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {classes.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "Tất cả các lớp" : `Lớp ${c}`}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={syncing}
            onClick={handleSyncSheet}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${syncing ? "animate-spin" : ""}`} />
            Tải từ Sheet NguoiDung
          </button>

          {isTeacher && (
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Thêm học sinh
            </button>
          )}
        </div>
      </div>

      {syncMsg && (
        <div className="text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl">
          {syncMsg}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">ID / Mã HS</th>
                <th className="px-5 py-3">Họ và tên</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Lớp</th>
                <th className="px-5 py-3">Cấp độ game</th>
                <th className="px-5 py-3 text-right">Bài học</th>
                <th className="px-5 py-3 text-right">Điểm XP</th>
                <th className="px-5 py-3 text-right">Game 60s</th>
                {isTeacher && <th className="px-5 py-3 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={isTeacher ? 9 : 8}
                    className="px-6 py-8 text-center text-sm text-slate-500"
                  >
                    Không có học sinh nào khớp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.username} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-indigo-700">
                      {s.username}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                      {s.name}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">{s.email}</td>
                    <td className="px-5 py-3.5 text-slate-700">{s.className}</td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {s.gameLevel || computeGameLevel(s.xp)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-slate-600">
                      {s.completedLectures.length}/{lecturesCount}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums font-bold text-indigo-700">
                      {s.xp}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums font-semibold text-amber-700">
                      {s.bestGame}
                    </td>
                    {isTeacher && (
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        {confirmDeleteUser === s.username ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteStudent(s.username);
                                setConfirmDeleteUser(null);
                              }}
                              className="text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 px-2.5 py-1 rounded-lg cursor-pointer"
                            >
                              Xóa ngay
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteUser(null)}
                              className="text-xs font-semibold text-slate-600 hover:bg-slate-100 px-2 py-1 rounded-lg cursor-pointer"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(s)}
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteUser(s.username)}
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="font-bold text-slate-900">
                {modalMode === "add"
                  ? "Thêm học sinh mới"
                  : `Cập nhật học sinh (${formUsername})`}
              </h4>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã học sinh / ID
                </label>
                <input
                  type="text"
                  required
                  disabled={modalMode === "edit"}
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="hs05"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Trần Minh Quân"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="minhquan.12a1@truong.edu.vn"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lớp
                  </label>
                  <input
                    type="text"
                    required
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    placeholder="12A1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mật khẩu
                  </label>
                  <input
                    type="text"
                    required
                    value={formPass}
                    onChange={(e) => setFormPass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Điểm XP
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formXp}
                    onChange={(e) => setFormXp(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {formError && (
                <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold cursor-pointer"
                >
                  Lưu & Đồng bộ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
