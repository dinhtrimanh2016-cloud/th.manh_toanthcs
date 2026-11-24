import React, { useState } from "react";
import { GOOGLE_APPS_SCRIPT_CODE } from "../data/mathData";
import {
  pingGoogleSheet,
  postToGoogleSheet,
  syncAllFromGoogleSheet,
} from "../utils/googleSheet";
import { Lecture, PdfDocument, QuizQuestion, UserAccount } from "../types";
import { Check, Copy, Database, PlugZap, RefreshCw, Save, UploadCloud } from "lucide-react";

interface SheetSettingsViewProps {
  gsUrl: string;
  users: UserAccount[];
  lectures: Lecture[];
  documents: PdfDocument[];
  questions: QuizQuestion[];
  onSaveGsUrl: (url: string) => void;
  onSyncAllData: (payload: {
    users: UserAccount[];
    lectures: Lecture[];
    documents: PdfDocument[];
    questions: QuizQuestion[];
  }) => void;
}

export const SheetSettingsView: React.FC<SheetSettingsViewProps> = ({
  gsUrl,
  users,
  lectures,
  documents,
  questions,
  onSaveGsUrl,
  onSyncAllData,
}) => {
  const [urlInput, setUrlInput] = useState(gsUrl);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    onSaveGsUrl(urlInput.trim());
    setStatus({
      type: "success",
      text: urlInput.trim()
        ? "Đã lưu URL Google Apps Script. Mọi thay đổi người dùng, bài giảng, PDF và câu hỏi sẽ tự động đồng bộ."
        : "Đã chuyển về chế độ lưu cục bộ (LocalStorage).",
    });
  };

  const handleTest = async () => {
    setBusy(true);
    setStatus({ type: "info", text: "Đang kiểm tra kết nối tới Google Sheet..." });
    const res = await pingGoogleSheet(urlInput);
    setStatus({
      type: res.ok ? "success" : "error",
      text: res.message,
    });
    setBusy(false);
  };

  const handlePullAll = async () => {
    const targetUrl = urlInput.trim() || gsUrl;
    if (!targetUrl) {
      setStatus({
        type: "error",
        text: "Vui lòng nhập và lưu URL Web App trước khi đồng bộ.",
      });
      return;
    }
    setBusy(true);
    setStatus({
      type: "info",
      text: "Đang tải dữ liệu từ 4 Sheet (NguoiDung, LyThuyet, TaiLieuPDF, CauHoi)...",
    });
    try {
      const data = await syncAllFromGoogleSheet(targetUrl);
      onSyncAllData(data);
      setStatus({
        type: "success",
        text: `Đồng bộ thành công: ${data.users.length} người dùng, ${data.lectures.length} bài giảng, ${data.documents.length} PDF, ${data.questions.length} câu hỏi.`,
      });
    } catch (err) {
      setStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Lỗi đồng bộ từ Google Sheet.",
      });
    } finally {
      setBusy(false);
    }
  };

  const handlePushSampleSeed = async () => {
    const targetUrl = urlInput.trim() || gsUrl;
    if (!targetUrl) {
      setStatus({
        type: "error",
        text: "Vui lòng nhập URL Web App trước khi đẩy dữ liệu mẫu lên Google Sheet.",
      });
      return;
    }
    setBusy(true);
    setStatus({
      type: "info",
      text: "Đang khởi tạo và đẩy dữ liệu hiện tại lên Google Sheet...",
    });
    try {
      for (const u of users) {
        await postToGoogleSheet(targetUrl, { action: "saveUser", user: u });
      }
      for (const l of lectures) {
        await postToGoogleSheet(targetUrl, { action: "saveLecture", lecture: l });
      }
      for (const d of documents) {
        await postToGoogleSheet(targetUrl, { action: "saveDocument", document: d });
      }
      for (const q of questions) {
        await postToGoogleSheet(targetUrl, { action: "saveQuestion", question: q });
      }
      setStatus({
        type: "success",
        text: `Đã đẩy thành công ${users.length} người dùng, ${lectures.length} bài giảng, ${documents.length} PDF và ${questions.length} câu hỏi lên Google Sheet!`,
      });
    } catch {
      setStatus({
        type: "error",
        text: "Có lỗi khi đẩy dữ liệu lên Google Sheet.",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatus({
        type: "error",
        text: "Không thể tự động sao chép, vui lòng bôi đen và copy thủ công.",
      });
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Configuration Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-8 space-y-5">
        <div className="flex items-start gap-3 pb-4 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Cấu hình Cơ sở dữ liệu Google Sheet (5 Sheets)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Lưu trữ NguoiDung, LyThuyet, TaiLieuPDF, CauHoi (LaTeX) và KetQua trực tiếp trên Google Sheets & Google Drive.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Google Apps Script Web App URL
          </label>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Lưu URL
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleTest}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition cursor-pointer"
          >
            <PlugZap className="w-4 h-4" />
            Kiểm tra kết nối
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handlePullAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-600 ${busy ? "animate-spin" : ""}`} />
            Tải toàn bộ từ Sheet
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handlePushSampleSeed}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            Khởi tạo & Đẩy dữ liệu mẫu lên Sheet
          </button>
        </div>

        {status && (
          <div
            className={`text-xs font-medium px-4 py-3 rounded-xl border ${
              status.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : status.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            {status.text}
          </div>
        )}
      </div>

      {/* Schema Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-8 space-y-4">
        <h4 className="text-base font-bold text-slate-900">
          Cấu trúc 5 trang tính tự động tạo trên Google Sheet
        </h4>
        <div className="grid md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-indigo-700">1. NguoiDung</div>
            <p className="text-slate-600">
              ID_Username, HoTen, Email, MatKhau, VaiTro, Lop, DiemXP, KyLucGame, CapDoGame, BaiDaHoc
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-indigo-700">2. LyThuyet</div>
            <p className="text-slate-600">
              ID, ChuyenDe, KhoiLop, TieuDe, ThoiLuong, TomTat, NoiDungLaTeX, TenFilePDF, LinkTaiLieuPDF
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-indigo-700">3. TaiLieuPDF</div>
            <p className="text-slate-600">
              ID, TieuDe, ChuyenDe, KhoiLop, MoTa, LinkPDF (Drive/URL), NguoiDang, NgayDang
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-indigo-700">4. CauHoi & 5. KetQua</div>
            <p className="text-slate-600">
              Ngân hàng Trắc nghiệm/Tự luận hỗ trợ $LaTeX$ + Lời giải chi tiết & Bảng điểm KetQua
            </p>
          </div>
        </div>
      </div>

      {/* 4-Step Guide & Code.gs */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Mã nguồn Google Apps Script (Code.gs)
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Hỗ trợ lưu cả link PDF và upload trực tiếp file PDF lên Google Drive của bạn.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Đã sao chép Code.gs" : "Sao chép Code.gs"}
          </button>
        </div>

        <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700">
          <li>
            Tạo trang tính mới trên Google Sheets →{" "}
            <strong>Tiện ích mở rộng (Extensions)</strong> →{" "}
            <strong>Apps Script</strong>.
          </li>
          <li>
            Dán toàn bộ mã <code>Code.gs</code> bên dưới và lưu lại (Ctrl + S).
          </li>
          <li>
            Nhấn <strong>Triển khai (Deploy)</strong> →{" "}
            <strong>Tạo bản triển khai mới</strong> → Chọn{" "}
            <strong>Ứng dụng web (Web app)</strong>, quyền truy cập{" "}
            <strong>Bất kỳ ai (Anyone)</strong>.
          </li>
          <li>
            Copy URL nhận được, dán vào ô phía trên, nhấn <strong>Lưu URL</strong>{" "}
            rồi nhấn <strong>Khởi tạo & Đẩy dữ liệu mẫu lên Sheet</strong> để tạo sẵn cả 5 trang tính.
          </li>
        </ol>

        <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-80 leading-relaxed">
          <code>{GOOGLE_APPS_SCRIPT_CODE}</code>
        </pre>
      </div>
    </div>
  );
};
