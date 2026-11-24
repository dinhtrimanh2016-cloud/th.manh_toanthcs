import React, { useState } from "react";
import { UserAccount } from "../types";
import { computeGameLevel } from "../data/mathData";
import { BookOpen, CheckCircle2, GraduationCap, ShieldCheck } from "lucide-react";

interface AuthScreenProps {
  users: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  onRegisterStudent: (newUser: UserAccount) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  users,
  onLoginSuccess,
  onRegisterStudent,
}) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regClass, setRegClass] = useState("");
  const [error, setError] = useState("");
  const [imgFailed, setImgFailed] = useState(false);

  const fillDemo = (u: string, p: string) => {
    setMode("login");
    setUsername(u);
    setPassword(p);
    setError("");
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = username.trim().toLowerCase();
    const found = users.find(
      (u) =>
        (u.username.toLowerCase() === identifier ||
          u.email.toLowerCase() === identifier) &&
        u.password === password
    );
    if (!found) {
      setError("Sai mã đăng nhập/email hoặc mật khẩu.");
      return;
    }
    setError("");
    onLoginSuccess(found);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    const cleanEmail = regEmail.trim();
    if (
      !cleanUsername ||
      !cleanEmail ||
      !regName.trim() ||
      !regClass.trim() ||
      password.length < 4
    ) {
      setError("Vui lòng điền đầy đủ thông tin (mật khẩu tối thiểu 4 ký tự).");
      return;
    }
    if (
      users.some(
        (u) =>
          u.username.toLowerCase() === cleanUsername.toLowerCase() ||
          u.email.toLowerCase() === cleanEmail.toLowerCase()
      )
    ) {
      setError("Mã học sinh hoặc email này đã tồn tại trong hệ thống.");
      return;
    }

    const newStudent: UserAccount = {
      username: cleanUsername,
      email: cleanEmail,
      password,
      name: regName.trim(),
      role: "student",
      className: regClass.trim(),
      xp: 50,
      bestGame: 0,
      gameLevel: computeGameLevel(50),
      completedLectures: [],
    };
    setError("");
    onRegisterStudent(newStudent);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl grid lg:grid-cols-12 border border-slate-200">
        {/* Left Visual Column */}
        <div className="lg:col-span-6 bg-slate-900 text-white relative flex flex-col justify-between p-8 lg:p-10 overflow-hidden">
          {!imgFailed && (
            <img
              src="/src/assets/images/hero_math_geometry_1794646507830.jpg"
              alt="Minh họa hình học tỷ lệ vàng và đa diện Toán học"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="absolute inset-0 w-full h-full object-cover opacity-35"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/75 to-slate-900/60" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight">MathMaster LMS</div>
                <div className="text-xs text-slate-300">
                  Hệ thống học tập môn Toán trực tuyến
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h1 className="text-2xl lg:text-3xl font-bold leading-tight text-balance">
                Học lý thuyết chuẩn LaTeX, lưu trữ PDF và đồng bộ Google Sheet
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                Nền tảng quản lý học sinh, kho bài giảng lý thuyết kèm PDF, ngân hàng câu hỏi trắc nghiệm & tự luận và trợ lý AI giải toán.
              </p>
            </div>

            <ul className="space-y-2.5 text-sm text-slate-200 pt-2">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Đồng bộ 5 bảng dữ liệu Google Sheet (NguoiDung, LyThuyet, TaiLieuPDF, CauHoi, KetQua)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hiển thị công thức Toán học LaTeX sắc nét với KaTeX</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Đấu trường tính nhanh 60s & Cấp độ thi đua XP</span>
              </li>
            </ul>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-white/15">
            <p className="text-xs font-medium text-slate-300 mb-3">
              Đăng nhập nhanh bằng tài khoản mẫu:
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => fillDemo("hs01", "123456")}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition whitespace-nowrap shrink-0 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-indigo-300" />
                Học sinh (hs01)
              </button>
              <button
                type="button"
                onClick={() => fillDemo("giaovien", "admin123")}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-xs font-semibold text-white transition whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                Giáo viên (admin)
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-6 border-b border-slate-200 mb-7">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`pb-3 text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                mode === "login"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`pb-3 text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                mode === "register"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Đăng ký học sinh
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mã đăng nhập hoặc Email
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ví dụ: hs01, giaovien hoặc email"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {error && (
                <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition cursor-pointer"
              >
                Đăng nhập vào hệ thống
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên học sinh
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nguyễn Văn An"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="vanan.12a1@truong.edu.vn"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã học sinh / ID
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="hs05"
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lớp
                  </label>
                  <input
                    type="text"
                    required
                    value={regClass}
                    onChange={(e) => setRegClass(e.target.value)}
                    placeholder="12A1"
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 4 ký tự"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {error && (
                <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition cursor-pointer"
              >
                Tạo tài khoản học sinh
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
