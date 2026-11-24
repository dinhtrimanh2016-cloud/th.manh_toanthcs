import React, { useMemo, useRef, useState } from "react";
import { validateLatexText } from "./MathText";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Maximize2,
  Minimize2,
  Move,
  ZoomIn,
  ZoomOut,
  HelpCircle,
} from "lucide-react";

export interface LatexSnippet {
  label: string;
  title: string;
  latex: string;
  block?: boolean;
  cursorBack?: number;
}

const LATEX_SNIPPETS: LatexSnippet[] = [
  { label: "$…$", title: "Công thức cùng dòng ($...$)", latex: "$$", cursorBack: 1 },
  {
    label: "$$…$$",
    title: "Công thức khối căn giữa ($$...$$)",
    latex: "\n$$\n\n$$\n",
    block: true,
    cursorBack: 4,
  },
  {
    label: "a/b",
    title: "Phân số \\frac{a}{b}",
    latex: "\\frac{a}{b}",
    cursorBack: 4,
  },
  {
    label: "√x",
    title: "Căn bậc hai \\sqrt{x}",
    latex: "\\sqrt{x}",
    cursorBack: 1,
  },
  {
    label: "xⁿ",
    title: "Lũy thừa x^{n}",
    latex: "x^{n}",
    cursorBack: 1,
  },
  {
    label: "xₙ",
    title: "Chỉ số dưới x_{n}",
    latex: "x_{n}",
    cursorBack: 1,
  },
  {
    label: "lim",
    title: "Giới hạn \\lim_{x \\to 0}",
    latex: "\\lim_{x \\to 0} ",
  },
  {
    label: "∫",
    title: "Tích phân xác định",
    latex: "\\int_{a}^{b} f(x)\\,dx",
  },
  {
    label: "∑",
    title: "Tổng Sigma",
    latex: "\\sum_{i=1}^{n} ",
  },
  {
    label: "{ Hệ",
    title: "Hệ phương trình",
    latex: "\\begin{cases} x + y = 1 \\\\ x - y = 0 \\end{cases}",
  },
  {
    label: "x⃗",
    title: "Vectơ",
    latex: "\\vec{u}",
    cursorBack: 1,
  },
  { label: "⇒", title: "Suy ra", latex: "\\Rightarrow " },
  { label: "⇔", title: "Tương đương", latex: "\\Leftrightarrow " },
  { label: "≤", title: "Nhỏ hơn hoặc bằng", latex: "\\le " },
  { label: "≥", title: "Lớn hơn hoặc bằng", latex: "\\ge " },
  { label: "≠", title: "Khác", latex: "\\neq " },
  { label: "∈", title: "Thuộc", latex: "\\in " },
  { label: "∀", title: "Với mọi", latex: "\\forall " },
  { label: "∞", title: "Vô cực", latex: "\\infty" },
  { label: "ℝ", title: "Tập số thực", latex: "\\mathbb{R}" },
];

export interface ActiveEditableField {
  element: HTMLInputElement | HTMLTextAreaElement;
  value: string;
  onChange: (next: string) => void;
  label: string;
}

function isCursorInsideMath(text: string, pos: number): boolean {
  const before = text.slice(0, pos);
  const doubleCount = (before.match(/\$\$/g) || []).length;
  if (doubleCount % 2 === 1) return true;
  const cleaned = before.replace(/\$\$/g, "");
  const singleCount = (cleaned.match(/(?<!\\)\$/g) || []).length;
  return singleCount % 2 === 1;
}

export function insertLatexSnippetIntoField(
  field: ActiveEditableField | null,
  snippet: LatexSnippet
) {
  if (!field) return;
  const { element, value, onChange } = field;
  const start = element.selectionStart ?? value.length;
  const end = element.selectionEnd ?? value.length;

  let textToInsert = snippet.latex;
  let cursorOffsetFromInsertEnd = -(snippet.cursorBack || 0);

  const isDelimiterButton = snippet.latex === "$$" || snippet.block;
  if (!isDelimiterButton && !isCursorInsideMath(value, start)) {
    textToInsert = `$${snippet.latex}$`;
    cursorOffsetFromInsertEnd = snippet.cursorBack ? -(snippet.cursorBack + 1) : 0;
  }

  const nextValue =
    value.slice(0, start) + textToInsert + value.slice(end);
  onChange(nextValue);

  const nextCursor = Math.max(
    0,
    start + textToInsert.length + cursorOffsetFromInsertEnd
  );

  window.requestAnimationFrame(() => {
    element.focus();
    element.setSelectionRange(nextCursor, nextCursor);
  });
}

interface LatexSnippetToolbarProps {
  activeFieldLabel?: string;
  onInsert: (snippet: LatexSnippet) => void;
}

export const LatexSnippetToolbar: React.FC<LatexSnippetToolbarProps> = ({
  activeFieldLabel,
  onInsert,
}) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-600 truncate">
          Chèn nhanh LaTeX
          {activeFieldLabel ? ` · Đang chọn: ${activeFieldLabel}` : ""}
        </span>
        <button
          type="button"
          onClick={() => setShowGuide((v) => !v)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-800 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          {showGuide ? "Ẩn cú pháp mẫu" : "Cú pháp mẫu"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {LATEX_SNIPPETS.map((s) => (
          <button
            key={s.label}
            type="button"
            title={s.title}
            onMouseDown={(e) => {
              // Prevent button click from stealing focus away from active input
              e.preventDefault();
            }}
            onClick={() => onInsert(s)}
            className="px-2 py-1 rounded-lg bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 border border-slate-200 text-xs font-mono font-medium text-slate-800 transition whitespace-nowrap shrink-0 cursor-pointer"
          >
            {s.label}
          </button>
        ))}
      </div>

      {showGuide && (
        <div className="grid sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
          <div>
            <code className="font-mono text-indigo-700">$x^2 + 3x$</code> → công thức cùng dòng
          </div>
          <div>
            <code className="font-mono text-indigo-700">$$\\frac{"{a}"}{"{b}"}$$</code> → công thức căn giữa
          </div>
          <div>
            <code className="font-mono text-indigo-700">**chữ đậm**</code> → in đậm nhấn mạnh
          </div>
          <div>
            <code className="font-mono text-indigo-700">{"\\begin{cases}...\\end{cases}"}</code> → hệ phương trình
          </div>
        </div>
      )}
    </div>
  );
};

interface KatexLivePreviewWindowProps {
  title?: string;
  textsToValidate: string[];
  children: React.ReactNode;
  activeEditingHint?: string;
}

export const KatexLivePreviewWindow: React.FC<KatexLivePreviewWindowProps> = ({
  title = "Live Preview · KaTeX",
  textsToValidate,
  children,
  activeEditingHint,
}) => {
  const [zoom, setZoom] = useState<90 | 100 | 115>(100);
  const [isFloating, setIsFloating] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // Draggable state for floating window mode
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 32, y: 32 });
  const dragRef = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({
    dragging: false,
    startX: 0,
    startY: 0,
    originX: 32,
    originY: 32,
  });

  const validation = useMemo(() => {
    const combined = textsToValidate.filter(Boolean).join("\n");
    return validateLatexText(combined);
  }, [textsToValidate]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isFloating) return;
    if ((e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: pos.x,
      originY: pos.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isFloating || !dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const nextX = Math.max(8, Math.min(window.innerWidth - 360, dragRef.current.originX + dx));
    const nextY = Math.max(8, Math.min(window.innerHeight - 120, dragRef.current.originY + dy));
    setPos({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.dragging) {
      dragRef.current.dragging = false;
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const zoomClass =
    zoom === 90
      ? "text-[13px]"
      : zoom === 115
      ? "text-[16px]"
      : "text-sm";

  const previewWindow = (
    <div
      style={
        isFloating
          ? {
              position: "fixed",
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              zIndex: 70,
              width: "min(520px, calc(100vw - 16px))",
            }
          : undefined
      }
      className={`flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden ${
        isFloating ? "shadow-2xl" : "h-full"
      }`}
    >
      {/* Preview Window Header */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`px-3.5 py-2.5 bg-slate-900 text-white flex items-center justify-between gap-2 select-none ${
          isFloating ? "cursor-move" : ""
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isFloating ? (
            <Move className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          ) : (
            <Eye className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
          )}
          <span className="text-xs font-bold tracking-tight truncate">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setZoom((z) => (z === 115 ? 100 : 90))}
            disabled={zoom === 90}
            title="Thu nhỏ chữ xem trước"
            className="p-1 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono tabular-nums text-slate-300 w-9 text-center">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => (z === 90 ? 100 : 115))}
            disabled={zoom === 115}
            title="Phóng to công thức"
            className="p-1 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {isFloating && (
            <button
              type="button"
              onClick={() => setIsMinimized((m) => !m)}
              title={isMinimized ? "Mở rộng" : "Thu gọn"}
              className="px-2 py-1 rounded hover:bg-slate-800 text-[11px] font-semibold text-slate-200 whitespace-nowrap cursor-pointer"
            >
              {isMinimized ? "Mở" : "Thu gọn"}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsFloating((f) => !f);
              setIsMinimized(false);
            }}
            title={
              isFloating
                ? "Gắn cửa sổ xem trước vào khung soạn thảo"
                : "Tách thành cửa sổ xem trước nổi (có thể kéo di chuyển)"
            }
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-indigo-600 text-[11px] font-semibold text-slate-100 whitespace-nowrap transition cursor-pointer"
          >
            {isFloating ? (
              <>
                <Minimize2 className="w-3 h-3" />
                Gắn lại
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3" />
                Cửa sổ nổi
              </>
            )}
          </button>
        </div>
      </div>

      {/* KaTeX Syntax Status Strip */}
      {!isMinimized && (
        <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
          {validation.valid ? (
            <div className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="tabular-nums">
                KaTeX hợp lệ · {validation.formulaCount} công thức
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowErrors((s) => !s)}
              className="inline-flex items-center gap-1.5 text-amber-800 font-semibold hover:underline cursor-pointer text-left"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span className="tabular-nums">
                Phát hiện {validation.errors.length} lỗi cú pháp LaTeX (Bấm để xem)
              </span>
            </button>
          )}

          {activeEditingHint && (
            <span className="text-[11px] text-slate-500 truncate">
              Đang nhập: {activeEditingHint}
            </span>
          )}
        </div>
      )}

      {/* Detailed KaTeX Errors */}
      {!isMinimized && !validation.valid && showErrors && (
        <div className="px-3.5 py-2.5 bg-amber-50 border-b border-amber-200 space-y-1.5 max-h-28 overflow-y-auto">
          {validation.errors.map((err, idx) => (
            <div key={idx} className="text-[11px] text-amber-900 space-y-0.5">
              <div className="font-mono font-semibold truncate">
                {err.snippet}
              </div>
              <div className="text-amber-800">{err.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* Rendered Preview Body */}
      {!isMinimized && (
        <div
          className={`flex-1 p-4 overflow-y-auto bg-slate-50/60 ${
            isFloating ? "max-h-[65vh]" : "min-h-[340px] max-h-[56vh]"
          } ${zoomClass}`}
        >
          {children}
        </div>
      )}
    </div>
  );

  if (isFloating) {
    return (
      <>
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center space-y-2.5">
          <Eye className="w-6 h-6 text-indigo-600 mx-auto" />
          <div className="text-xs font-semibold text-slate-800">
            Cửa sổ Live Preview đang ở chế độ nổi
          </div>
          <p className="text-xs text-slate-500">
            Bạn có thể kéo thả cửa sổ xem trước đến bất kỳ vị trí nào trên màn hình.
          </p>
          <button
            type="button"
            onClick={() => setIsFloating(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Gắn lại vào khung soạn thảo
          </button>
        </div>
        {previewWindow}
      </>
    );
  }

  return previewWindow;
};
