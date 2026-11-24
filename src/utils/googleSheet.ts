import { Lecture, PdfDocument, QuizQuestion, UserAccount } from "../types";

export async function pingGoogleSheet(
  url: string
): Promise<{ ok: boolean; message: string }> {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    return { ok: false, message: "Vui lòng nhập URL Google Apps Script Web App." };
  }
  try {
    const res = await fetch(`${cleanUrl}?action=ping`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { status?: string; message?: string };
    if (data.status === "ok") {
      return {
        ok: true,
        message: data.message || "Kết nối Google Sheet thành công!",
      };
    }
    return { ok: false, message: "Phản hồi từ Google Sheet không hợp lệ." };
  } catch {
    return {
      ok: false,
      message:
        "Không thể kết nối tới URL. Hãy kiểm tra quyền truy cập 'Anyone' khi triển khai Apps Script.",
    };
  }
}

export async function postToGoogleSheet<T = Record<string, unknown>>(
  url: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; data?: T }> {
  if (!url.trim()) return { ok: false };
  try {
    const res = await fetch(url.trim(), {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { ok: false };
    try {
      const data = (await res.json()) as T;
      return { ok: true, data };
    } catch {
      return { ok: true };
    }
  } catch {
    return { ok: false };
  }
}

export async function syncAllFromGoogleSheet(url: string): Promise<{
  users: UserAccount[];
  lectures: Lecture[];
  documents: PdfDocument[];
  questions: QuizQuestion[];
}> {
  const res = await fetch(`${url.trim()}?action=syncAll`);
  if (!res.ok) throw new Error("Không thể đồng bộ dữ liệu từ Google Sheet.");
  const data = (await res.json()) as {
    status?: string;
    users?: UserAccount[];
    lectures?: Lecture[];
    documents?: PdfDocument[];
    questions?: QuizQuestion[];
  };
  if (data.status !== "ok") {
    throw new Error("Google Sheet trả về phản hồi không hợp lệ.");
  }
  return {
    users: Array.isArray(data.users) ? data.users : [],
    lectures: Array.isArray(data.lectures) ? data.lectures : [],
    documents: Array.isArray(data.documents) ? data.documents : [],
    questions: Array.isArray(data.questions) ? data.questions : [],
  };
}

export async function fetchQuestionsFromSheet(
  url: string
): Promise<QuizQuestion[]> {
  const res = await fetch(`${url.trim()}?action=getQuestions`);
  if (!res.ok) throw new Error("Không thể tải dữ liệu từ Sheet CauHoi.");
  const data = (await res.json()) as {
    status?: string;
    questions?: QuizQuestion[];
  };
  if (!Array.isArray(data.questions)) {
    throw new Error("Cấu trúc dữ liệu câu hỏi trên Sheet không đúng.");
  }
  return data.questions;
}

export async function fetchLeaderboardFromSheet(
  url: string
): Promise<UserAccount[]> {
  const res = await fetch(`${url.trim()}?action=getLeaderboard`);
  if (!res.ok) throw new Error("Không thể đồng bộ bảng xếp hạng.");
  const data = (await res.json()) as {
    status?: string;
    users?: UserAccount[];
    students?: UserAccount[];
  };
  return Array.isArray(data.users)
    ? data.users
    : Array.isArray(data.students)
    ? data.students
    : [];
}

export function getEmbeddablePdfUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  // Convert Google Drive /file/d/ID/view to /file/d/ID/preview for iframe embedding
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  return trimmed;
}
