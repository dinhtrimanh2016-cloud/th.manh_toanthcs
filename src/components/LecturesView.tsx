import React, { useMemo, useRef, useState } from "react";
import { Lecture, PdfDocument } from "../types";
import { getEmbeddablePdfUrl, postToGoogleSheet } from "../utils/googleSheet";
import { MathInline, MathText } from "./MathText";
import {
  ActiveEditableField,
  insertLatexSnippetIntoField,
  KatexLivePreviewWindow,
  LatexSnippetToolbar,
} from "./LatexPreviewStudio";
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

interface LecturesViewProps {
  lectures: Lecture[];
  documents: PdfDocument[];
  completedLectures: string[];
  isTeacher: boolean;
  teacherName: string;
  gsUrl: string;
  onCompleteLecture: (lectureId: string) => void;
  onSaveLecture: (lecture: Lecture) => void;
  onDeleteLecture: (id: string) => void;
  onSaveDocument: (doc: PdfDocument) => void;
  onDeleteDocument: (id: string) => void;
}

const CATEGORIES: Array<"all" | Lecture["category"]> = [
  "all",
  "Giải tích",
  "Đại số",
  "Hình học",
  "Xác suất",
];

const PDF_CATEGORIES: Array<"all" | PdfDocument["category"]> = [
  "all",
  "Giải tích",
  "Đại số",
  "Hình học",
  "Xác suất",
  "Tổng hợp",
];

export const LecturesView: React.FC<LecturesViewProps> = ({
  lectures,
  documents,
  completedLectures,
  isTeacher,
  teacherName,
  gsUrl,
  onCompleteLecture,
  onSaveLecture,
  onDeleteLecture,
  onSaveDocument,
  onDeleteDocument,
}) => {
  const [subTab, setSubTab] = useState<"lectures" | "pdfs">("lectures");
  const [category, setCategory] = useState<"all" | Lecture["category"]>("all");
  const [pdfCategory, setPdfCategory] = useState<"all" | PdfDocument["category"]>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(lectures[0]?.id || "");

  // PDF Preview Modal State
  const [previewPdf, setPreviewPdf] = useState<{ title: string; url: string } | null>(
    null
  );

  // Teacher Lecture Editor Modal
  const [lecModalOpen, setLecModalOpen] = useState(false);
  const [editingLecId, setEditingLecId] = useState<string | null>(null);
  const [lecTitle, setLecTitle] = useState("");
  const [lecCategory, setLecCategory] = useState<Lecture["category"]>("Giải tích");
  const [lecGrade, setLecGrade] = useState("Lớp 12");
  const [lecDuration, setLecDuration] = useState("15 phút");
  const [lecSummary, setLecSummary] = useState("");
  const [lecBody, setLecBody] = useState("");
  const [lecPdfTitle, setLecPdfTitle] = useState("");
  const [lecPdfUrl, setLecPdfUrl] = useState("");
  const [showLecPreview, setShowLecPreview] = useState(true);
  const [activeLecFieldKey, setActiveLecFieldKey] = useState<"title" | "summary" | "body">("body");
  const lecTitleRef = useRef<HTMLInputElement | null>(null);
  const lecSummaryRef = useRef<HTMLInputElement | null>(null);
  const lecBodyRef = useRef<HTMLTextAreaElement | null>(null);

  const getActiveLectureField = (): ActiveEditableField | null => {
    if (activeLecFieldKey === "title" && lecTitleRef.current) {
      return {
        element: lecTitleRef.current,
        value: lecTitle,
        onChange: setLecTitle,
        label: "Tiêu đề",
      };
    }
    if (activeLecFieldKey === "summary" && lecSummaryRef.current) {
      return {
        element: lecSummaryRef.current,
        value: lecSummary,
        onChange: setLecSummary,
        label: "Tóm tắt",
      };
    }
    if (lecBodyRef.current) {
      return {
        element: lecBodyRef.current,
        value: lecBody,
        onChange: setLecBody,
        label: "Nội dung bài giảng",
      };
    }
    return null;
  };

  const activeLecFieldLabel =
    activeLecFieldKey === "title"
      ? "Tiêu đề bài giảng"
      : activeLecFieldKey === "summary"
      ? "Tóm tắt ngắn"
      : "Nội dung bài giảng";

  // Teacher PDF Upload Modal
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfCat, setPdfCat] = useState<PdfDocument["category"]>("Tổng hợp");
  const [pdfGrade, setPdfGrade] = useState("Lớp 12");
  const [pdfDesc, setPdfDesc] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<{ name: string; base64: string } | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfStatusMsg, setPdfStatusMsg] = useState("");

  const filteredLectures = useMemo(() => {
    const q = search.trim().toLowerCase();
    return lectures.filter((lec) => {
      const matchCat = category === "all" || lec.category === category;
      const matchQuery =
        !q ||
        lec.title.toLowerCase().includes(q) ||
        lec.summary.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [lectures, category, search]);

  const filteredPdfs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchCat = pdfCategory === "all" || doc.category === pdfCategory;
      const matchQuery =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [documents, pdfCategory, search]);

  const activeLecture =
    lectures.find((l) => l.id === selectedId) || filteredLectures[0] || lectures[0];

  const isDone = activeLecture
    ? completedLectures.includes(activeLecture.id)
    : false;

  const openNewLectureModal = () => {
    setEditingLecId(null);
    setLecTitle("");
    setLecCategory("Giải tích");
    setLecGrade("Lớp 12");
    setLecDuration("15 phút");
    setLecSummary("");
    setLecBody(
      "Cho hàm số $y = f(x)$ có đạo hàm trên $K$:\n$$f'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x)-f(x)}{\\Delta x}$$"
    );
    setLecPdfTitle("");
    setLecPdfUrl("");
    setLecModalOpen(true);
  };

  const openEditLectureModal = (lec: Lecture) => {
    setEditingLecId(lec.id);
    setLecTitle(lec.title);
    setLecCategory(lec.category);
    setLecGrade(lec.grade);
    setLecDuration(lec.duration);
    setLecSummary(lec.summary);
    setLecBody(
      lec.rawContent ||
        lec.sections
          .map((s) => `**${s.heading}**\n${s.body}${s.formula ? `\n${s.formula}` : ""}`)
          .join("\n\n")
    );
    setLecPdfTitle(lec.pdfTitle || "");
    setLecPdfUrl(lec.pdfUrl || "");
    setLecModalOpen(true);
  };

  const handleSaveLectureForm = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingLecId || `lec-${Date.now()}`;
    const newLec: Lecture = {
      id,
      category: lecCategory,
      grade: lecGrade.trim() || "Lớp 12",
      title: lecTitle.trim(),
      duration: lecDuration.trim() || "15 phút",
      summary: lecSummary.trim(),
      rawContent: lecBody,
      pdfTitle: lecPdfTitle.trim() || undefined,
      pdfUrl: lecPdfUrl.trim() || undefined,
      sections: [
        {
          heading: "Nội dung bài giảng lý thuyết",
          body: lecBody,
        },
      ],
    };
    onSaveLecture(newLec);
    setSelectedId(id);
    setLecModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      setPdfFile({ name: file.name, base64 });
      if (!pdfTitle) setPdfTitle(file.name.replace(/\.pdf$/i, ""));
    };
    reader.readAsDataURL(file);
  };

  const handleSavePdfDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setPdfStatusMsg("");
    if (!pdfUrl.trim() && !pdfFile) {
      setPdfStatusMsg("Vui lòng dán link PDF/Google Drive hoặc chọn file PDF từ máy.");
      return;
    }

    setUploadingPdf(true);
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${now.getFullYear()}`;

    let finalUrl = pdfUrl.trim();
    const docId = `pdf-${Date.now()}`;
    const draftDoc: PdfDocument = {
      id: docId,
      title: pdfTitle.trim(),
      category: pdfCat,
      grade: pdfGrade.trim() || "Lớp 12",
      description: pdfDesc.trim(),
      pdfUrl: finalUrl,
      uploadedBy: teacherName,
      createdAt: dateStr,
    };

    if (pdfFile && gsUrl.trim()) {
      const res = await postToGoogleSheet<{ pdfUrl?: string }>(gsUrl, {
        action: "saveDocument",
        document: draftDoc,
        fileBase64: pdfFile.base64,
        fileName: pdfFile.name,
      });
      if (res.ok && res.data?.pdfUrl) {
        finalUrl = res.data.pdfUrl;
      }
    } else if (pdfFile && !finalUrl) {
      finalUrl = `data:application/pdf;base64,${pdfFile.base64}`;
    }

    onSaveDocument({ ...draftDoc, pdfUrl: finalUrl });
    setUploadingPdf(false);
    setPdfModalOpen(false);
    setPdfTitle("");
    setPdfDesc("");
    setPdfUrl("");
    setPdfFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setSubTab("lectures")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
              subTab === "lectures"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Bài giảng lý thuyết (LyThuyet)
          </button>
          <button
            type="button"
            onClick={() => setSubTab("pdfs")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
              subTab === "pdfs"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Kho tài liệu PDF ({documents.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                subTab === "lectures"
                  ? "Tìm bài giảng lý thuyết..."
                  : "Tìm tài liệu PDF..."
              }
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
            />
          </div>

          {isTeacher && subTab === "lectures" && (
            <button
              type="button"
              onClick={openNewLectureModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm bài giảng
            </button>
          )}

          {isTeacher && subTab === "pdfs" && (
            <button
              type="button"
              onClick={() => {
                setPdfStatusMsg("");
                setPdfModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Lưu tài liệu PDF mới
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: BÀI GIẢNG LÝ THUYẾT */}
      {subTab === "lectures" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-xl w-fit">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  category === cat
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat === "all" ? "Tất cả chuyên đề" : cat}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 space-y-2.5">
              {filteredLectures.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-sm text-slate-500">
                  Không tìm thấy bài giảng phù hợp.
                </div>
              ) : (
                filteredLectures.map((lec) => {
                  const completed = completedLectures.includes(lec.id);
                  const selected = activeLecture && lec.id === activeLecture.id;
                  return (
                    <button
                      key={lec.id}
                      type="button"
                      onClick={() => setSelectedId(lec.id)}
                      className={`w-full text-left p-4 rounded-xl border transition cursor-pointer ${
                        selected
                          ? "bg-indigo-50/70 border-indigo-500"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1.5">
                        <span>
                          {lec.category} · {lec.grade} · {lec.duration}
                        </span>
                        {completed && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đã học
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">
                        <MathInline text={lec.title} />
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        <MathInline text={lec.summary} />
                      </p>
                    </button>
                  );
                })
              )}
            </div>

            {/* Lecture Content Panel */}
            {activeLecture && (
              <article className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 lg:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200">
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-slate-500">
                      {activeLecture.category} · {activeLecture.grade} ·{" "}
                      {activeLecture.duration}
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-900">
                      <MathInline text={activeLecture.title} />
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {isTeacher && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEditLectureModal(activeLecture)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteLecture(activeLecture.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-xs font-semibold text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Xóa
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      disabled={isDone}
                      onClick={() => onCompleteLecture(activeLecture.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                        isDone
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isDone
                        ? "Đã hoàn thành (+50 XP)"
                        : "Đánh dấu hoàn thành (+50 XP)"}
                    </button>
                  </div>
                </div>

                {/* Attached PDF Bar */}
                {activeLecture.pdfUrl && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {activeLecture.pdfTitle || "Tài liệu PDF đính kèm bài giảng"}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          Lưu trữ trên Google Sheet LyThuyet
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewPdf({
                            title:
                              activeLecture.pdfTitle || activeLecture.title,
                            url: activeLecture.pdfUrl!,
                          })
                        }
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                      >
                        Xem PDF trực tiếp
                      </button>
                      <a
                        href={activeLecture.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 whitespace-nowrap"
                      >
                        Mở link
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}

                <div className="space-y-7">
                  {activeLecture.sections.map((sec, idx) => (
                    <section key={idx} className="space-y-3">
                      <h4 className="text-base font-bold text-indigo-700">
                        <MathInline text={sec.heading} />
                      </h4>
                      <div className="text-sm lg:text-[15px] text-slate-700">
                        <MathText text={sec.body} />
                      </div>

                      {sec.formula && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900">
                          <MathText text={sec.formula} />
                        </div>
                      )}

                      {sec.bullets && sec.bullets.length > 0 && (
                        <ul className="list-disc pl-5 space-y-2 text-sm lg:text-[15px] text-slate-700">
                          {sec.bullets.map((b, bIdx) => (
                            <li key={bIdx}>
                              <MathInline text={b} />
                            </li>
                          ))}
                        </ul>
                      )}

                      {sec.example && (
                        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-1.5 text-sm text-slate-800">
                          <div className="font-bold text-amber-900">
                            {sec.example.title}
                          </div>
                          <MathText text={sec.example.content} />
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              </article>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: KHO TÀI LIỆU PDF */}
      {subTab === "pdfs" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-xl w-fit">
            {PDF_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setPdfCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  pdfCategory === cat
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat === "all" ? "Tất cả tài liệu" : cat}
              </button>
            ))}
          </div>

          {filteredPdfs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-500">
              Chưa có tài liệu PDF nào khớp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPdfs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      {isTeacher && (
                        <button
                          type="button"
                          onClick={() => onDeleteDocument(doc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Xóa tài liệu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-slate-500">
                      {doc.category} · {doc.grade} · {doc.createdAt}
                    </div>
                    <h4 className="text-base font-bold text-slate-900">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {doc.description || "Tài liệu ôn tập Toán học định dạng PDF."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewPdf({ title: doc.title, url: doc.pdfUrl })
                      }
                      className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer"
                    >
                      Xem tài liệu PDF
                    </button>
                    <a
                      href={doc.pdfUrl}
                      download={`${doc.title}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                    >
                      Tải về
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: XEM TRƯỚC PDF */}
      {previewPdf && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-sm lg:text-base truncate">
                  {previewPdf.title}
                </h4>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewPdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                >
                  Mở tab mới
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewPdf(null)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100">
              <iframe
                src={getEmbeddablePdfUrl(previewPdf.url)}
                title={previewPdf.title}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM / SỬA BÀI GIẢNG LÝ THUYẾT (LATEX + LIVE PREVIEW KATEX) */}
      {lecModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className={`bg-white rounded-2xl border border-slate-200 w-full ${
              showLecPreview ? "max-w-6xl" : "max-w-3xl"
            } max-h-[92vh] flex flex-col overflow-hidden shadow-2xl transition-all`}
          >
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 truncate">
                  {editingLecId
                    ? "Chỉnh sửa bài giảng (Sheet LyThuyet)"
                    : "Soạn thảo bài giảng mới (Sheet LyThuyet)"}
                </h4>
                <p className="text-xs text-slate-500 truncate">
                  Nhập văn bản và công thức $LaTeX$ để xem trước trực tiếp qua KaTeX
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowLecPreview((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                    showLecPreview
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {showLecPreview ? (
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
                  onClick={() => setLecModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSaveLectureForm}
              className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5"
            >
              <div
                className={`grid gap-6 items-start ${
                  showLecPreview ? "lg:grid-cols-12" : "grid-cols-1"
                }`}
              >
                {/* Left Column: Lecture Authoring Inputs */}
                <div
                  className={`space-y-4 ${
                    showLecPreview ? "lg:col-span-7" : ""
                  }`}
                >
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tiêu đề bài giảng (hỗ trợ $LaTeX$)
                      </label>
                      <input
                        ref={lecTitleRef}
                        type="text"
                        required
                        value={lecTitle}
                        onFocus={() => setActiveLecFieldKey("title")}
                        onChange={(e) => setLecTitle(e.target.value)}
                        placeholder="Ví dụ: Cực trị hàm số bậc ba $y = ax^3 + bx^2 + cx + d$"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Chuyên đề
                      </label>
                      <select
                        value={lecCategory}
                        onChange={(e) =>
                          setLecCategory(e.target.value as Lecture["category"])
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                      >
                        <option value="Giải tích">Giải tích</option>
                        <option value="Đại số">Đại số</option>
                        <option value="Hình học">Hình học</option>
                        <option value="Xác suất">Xác suất</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Khối lớp
                      </label>
                      <input
                        type="text"
                        value={lecGrade}
                        onChange={(e) => setLecGrade(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Thời lượng
                      </label>
                      <input
                        type="text"
                        value={lecDuration}
                        onChange={(e) => setLecDuration(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tóm tắt ngắn (hỗ trợ $LaTeX$)
                      </label>
                      <input
                        ref={lecSummaryRef}
                        type="text"
                        required
                        value={lecSummary}
                        onFocus={() => setActiveLecFieldKey("summary")}
                        onChange={(e) => setLecSummary(e.target.value)}
                        placeholder="Nội dung trọng tâm của bài..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <LatexSnippetToolbar
                    activeFieldLabel={activeLecFieldLabel}
                    onInsert={(snippet) =>
                      insertLatexSnippetIntoField(
                        getActiveLectureField(),
                        snippet
                      )
                    }
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nội dung bài giảng (Hỗ trợ $...$, $$...$$ và **chữ đậm**)
                    </label>
                    <textarea
                      ref={lecBodyRef}
                      rows={10}
                      required
                      value={lecBody}
                      onFocus={() => setActiveLecFieldKey("body")}
                      onChange={(e) => setLecBody(e.target.value)}
                      placeholder="Nhập lý thuyết, ví dụ minh họa và công thức LaTeX..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên tài liệu PDF đính kèm (tùy chọn)
                      </label>
                      <input
                        type="text"
                        value={lecPdfTitle}
                        onChange={(e) => setLecPdfTitle(e.target.value)}
                        placeholder="Chuyên đề bài giảng PDF"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Link PDF / Google Drive (tùy chọn)
                      </label>
                      <input
                        type="url"
                        value={lecPdfUrl}
                        onChange={(e) => setLecPdfUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/.../view"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Live KaTeX Preview Window */}
                {showLecPreview && (
                  <div className="lg:col-span-5 lg:sticky lg:top-0">
                    <KatexLivePreviewWindow
                      title="Cửa sổ Live Preview · Bài giảng"
                      textsToValidate={[lecTitle, lecSummary, lecBody]}
                      activeEditingHint={activeLecFieldLabel}
                    >
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                        <div className="space-y-1.5 pb-3 border-b border-slate-100">
                          <div className="text-xs font-medium text-slate-500">
                            {lecCategory} · {lecGrade || "Lớp 12"} ·{" "}
                            {lecDuration || "15 phút"}
                          </div>
                          <h4 className="text-lg font-bold text-slate-900">
                            {lecTitle.trim() ? (
                              <MathInline text={lecTitle} />
                            ) : (
                              <span className="text-slate-400 font-normal">
                                Tiêu đề bài giảng sẽ hiển thị ở đây...
                              </span>
                            )}
                          </h4>
                          {lecSummary.trim() && (
                            <p className="text-xs text-slate-600 leading-relaxed">
                              <MathInline text={lecSummary} />
                            </p>
                          )}
                        </div>

                        {lecPdfUrl.trim() && (
                          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700">
                            <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                            <span className="truncate font-medium">
                              {lecPdfTitle.trim() || "Tài liệu PDF đính kèm"}
                            </span>
                          </div>
                        )}

                        <div className="text-slate-800">
                          {lecBody.trim() ? (
                            <MathText text={lecBody} />
                          ) : (
                            <p className="text-slate-400 text-xs italic">
                              Nhập nội dung và công thức $LaTeX$ bên trái để xem trước ngay lập tức...
                            </p>
                          )}
                        </div>
                      </div>
                    </KatexLivePreviewWindow>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setLecModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold cursor-pointer"
                >
                  Lưu bài giảng lên Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: THÊM TÀI LIỆU PDF */}
      {pdfModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="font-bold text-slate-900">
                Lưu tài liệu PDF mới (Sheet TaiLieuPDF)
              </h4>
              <button
                type="button"
                onClick={() => setPdfModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePdfDocument} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên tài liệu PDF
                </label>
                <input
                  type="text"
                  required
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  placeholder="Bộ đề ôn thi học kỳ 1 Toán 12"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chuyên đề
                  </label>
                  <select
                    value={pdfCat}
                    onChange={(e) =>
                      setPdfCat(e.target.value as PdfDocument["category"])
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="Tổng hợp">Tổng hợp</option>
                    <option value="Giải tích">Giải tích</option>
                    <option value="Đại số">Đại số</option>
                    <option value="Hình học">Hình học</option>
                    <option value="Xác suất">Xác suất</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khối lớp
                  </label>
                  <input
                    type="text"
                    value={pdfGrade}
                    onChange={(e) => setPdfGrade(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả ngắn
                </label>
                <input
                  type="text"
                  value={pdfDesc}
                  onChange={(e) => setPdfDesc(e.target.value)}
                  placeholder="Gồm 40 câu trắc nghiệm và 4 câu tự luận có lời giải"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Link PDF hoặc Link chia sẻ Google Drive
                </label>
                <input
                  type="url"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hoặc tải file .pdf trực tiếp từ máy tính
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {pdfFile && (
                  <p className="text-xs text-emerald-700 mt-1">
                    Đã chọn file: {pdfFile.name}{" "}
                    {gsUrl ? "(Sẽ tự động lưu lên Google Drive qua Apps Script)" : ""}
                  </p>
                )}
              </div>

              {pdfStatusMsg && (
                <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                  {pdfStatusMsg}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPdfModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploadingPdf}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold cursor-pointer"
                >
                  {uploadingPdf ? "Đang lưu..." : "Lưu tài liệu PDF"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
