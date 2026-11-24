import React from "react";
import katex from "katex";

export interface LatexValidationError {
  snippet: string;
  message: string;
}

export interface LatexValidationResult {
  valid: boolean;
  formulaCount: number;
  errors: LatexValidationError[];
}

interface MathTextProps {
  text: string;
  className?: string;
}

function renderLatexToHtml(expr: string, displayMode: boolean): string {
  try {
    return katex.renderToString(expr.trim(), {
      displayMode,
      throwOnError: false,
      strict: false,
    });
  } catch {
    return expr;
  }
}

/**
 * Splits text into segments of display math ($$...$$ or \[...\]) and normal text.
 */
function splitDisplayMath(text: string): string[] {
  return text.split(/(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\])/g);
}

/**
 * Splits a single line into inline math ($...$ or \(...\)) and plain/formatted text.
 */
function splitInlineMath(segment: string): string[] {
  return segment.split(/((?<!\\)\$[^$\n]+?(?<!\\)\$|\\\([\s\S]+?\\\))/g);
}

export function validateLatexText(text: string): LatexValidationResult {
  const errors: LatexValidationError[] = [];
  let formulaCount = 0;

  if (!text || !text.trim()) {
    return { valid: true, formulaCount: 0, errors: [] };
  }

  const displayParts = splitDisplayMath(text);

  displayParts.forEach((part) => {
    if (
      (part.startsWith("$$") && part.endsWith("$$") && part.length >= 4) ||
      (part.startsWith("\\[") && part.endsWith("\\]") && part.length >= 4)
    ) {
      const expr = part.slice(2, -2).trim();
      formulaCount += 1;
      if (!expr) {
        errors.push({
          snippet: part,
          message: "Khối công thức $$...$$ đang bị rỗng.",
        });
        return;
      }
      try {
        katex.renderToString(expr, {
          displayMode: true,
          throwOnError: true,
          strict: false,
        });
      } catch (err) {
        errors.push({
          snippet: expr.slice(0, 60),
          message:
            err instanceof Error ? err.message : "Lỗi cú pháp LaTeX khối.",
        });
      }
      return;
    }

    // Check unclosed $$ or \[ / \] in non-matched chunks
    if (part.includes("$$")) {
      errors.push({
        snippet: "$$",
        message: "Có dấu $$ chưa được đóng cặp.",
      });
    }

    const lines = part.split("\n");
    lines.forEach((line) => {
      const inlineParts = splitInlineMath(line);
      let remainingPlain = "";

      inlineParts.forEach((inlinePart) => {
        if (
          (inlinePart.startsWith("$") &&
            inlinePart.endsWith("$") &&
            inlinePart.length >= 2) ||
          (inlinePart.startsWith("\\(") &&
            inlinePart.endsWith("\\)") &&
            inlinePart.length >= 4)
        ) {
          const expr = inlinePart.startsWith("$")
            ? inlinePart.slice(1, -1).trim()
            : inlinePart.slice(2, -2).trim();
          formulaCount += 1;
          if (!expr) {
            errors.push({
              snippet: inlinePart,
              message: "Công thức $...$ đang bị rỗng.",
            });
            return;
          }
          try {
            katex.renderToString(expr, {
              displayMode: false,
              throwOnError: true,
              strict: false,
            });
          } catch (err) {
            errors.push({
              snippet: expr.slice(0, 60),
              message:
                err instanceof Error ? err.message : "Lỗi cú pháp LaTeX.",
            });
          }
        } else {
          remainingPlain += inlinePart;
        }
      });

      // Detect unclosed single $ on a line (ignoring escaped \$)
      const unescapedDollars = remainingPlain.match(/(?<!\\)\$/g);
      if (unescapedDollars && unescapedDollars.length > 0) {
        errors.push({
          snippet: line.trim().slice(0, 60),
          message: "Có dấu $ mở công thức nhưng chưa đóng $ trên cùng dòng.",
        });
      }
    });
  });

  return {
    valid: errors.length === 0,
    formulaCount,
    errors,
  };
}

function renderInlineFormatting(
  segment: string,
  keyPrefix: string
): React.ReactNode[] {
  const mathParts = splitInlineMath(segment);
  const nodes: React.ReactNode[] = [];

  mathParts.forEach((part, idx) => {
    const isDollar =
      part.startsWith("$") && part.endsWith("$") && part.length >= 2;
    const isParen =
      part.startsWith("\\(") && part.endsWith("\\)") && part.length >= 4;

    if (isDollar || isParen) {
      const expr = isDollar ? part.slice(1, -1) : part.slice(2, -2);
      nodes.push(
        <span
          key={`${keyPrefix}-m-${idx}`}
          className="inline-block align-middle mx-0.5"
          dangerouslySetInnerHTML={{ __html: renderLatexToHtml(expr, false) }}
        />
      );
      return;
    }

    const cleanPart = part.replace(/\\\$/g, "$");
    // Parse **bold** and `code`
    const tokenParts = cleanPart.split(/(\*\*[^*]+?\*\*|`[^`]+?`)/g);
    tokenParts.forEach((tok, tIdx) => {
      if (tok.startsWith("**") && tok.endsWith("**") && tok.length > 4) {
        nodes.push(
          <strong
            key={`${keyPrefix}-b-${idx}-${tIdx}`}
            className="font-semibold text-slate-900"
          >
            {tok.slice(2, -2)}
          </strong>
        );
      } else if (tok.startsWith("`") && tok.endsWith("`") && tok.length > 2) {
        nodes.push(
          <code
            key={`${keyPrefix}-c-${idx}-${tIdx}`}
            className="font-mono text-[0.85em] bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded border border-slate-200"
          >
            {tok.slice(1, -1)}
          </code>
        );
      } else if (tok) {
        nodes.push(
          <React.Fragment key={`${keyPrefix}-t-${idx}-${tIdx}`}>
            {tok}
          </React.Fragment>
        );
      }
    });
  });

  return nodes;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = "" }) => {
  const blockParts = splitDisplayMath(text);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {blockParts.map((block, bIdx) => {
        const isDoubleDollar =
          block.startsWith("$$") && block.endsWith("$$") && block.length >= 4;
        const isBracket =
          block.startsWith("\\[") && block.endsWith("\\]") && block.length >= 4;

        if (isDoubleDollar || isBracket) {
          const expr = block.slice(2, -2);
          return (
            <div
              key={`blk-${bIdx}`}
              className="overflow-x-auto py-1 text-center"
              dangerouslySetInnerHTML={{ __html: renderLatexToHtml(expr, true) }}
            />
          );
        }

        const lines = block.split("\n");
        return lines.map((line, lIdx) => {
          if (!line.trim()) return null;
          return (
            <p key={`ln-${bIdx}-${lIdx}`} className="leading-relaxed">
              {renderInlineFormatting(line, `${bIdx}-${lIdx}`)}
            </p>
          );
        });
      })}
    </div>
  );
};

export const MathInline: React.FC<{ text: string; className?: string }> = ({
  text,
  className = "",
}) => {
  return (
    <span className={className}>{renderInlineFormatting(text, "inline")}</span>
  );
};
