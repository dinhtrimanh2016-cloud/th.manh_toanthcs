import { derivative, evaluate, parse, simplify } from "mathjs";

export function solveMathLocally(raw: string): string {
  const lower = raw.toLowerCase().trim();

  // 1. Tra cứu công thức Toán học nhanh
  if (lower.includes("vi-ét") || lower.includes("viet")) {
    return [
      "**Định lý Vi-ét** cho phương trình $ax^2 + bx + c = 0$ (với $\\Delta \\ge 0$):",
      "$$x_1 + x_2 = -\\frac{b}{a}, \\qquad x_1 \\cdot x_2 = \\frac{c}{a}$$",
      "Mẹo nhẩm: Nếu $a+b+c=0 \\Rightarrow x_1=1, x_2=\\frac{c}{a}$; nếu $a-b+c=0 \\Rightarrow x_1=-1, x_2=-\\frac{c}{a}$.",
    ].join("\n\n");
  }

  if (lower.includes("hằng đẳng thức")) {
    return [
      "**7 Hằng đẳng thức đáng nhớ:**",
      "1. $(a+b)^2 = a^2 + 2ab + b^2$",
      "2. $(a-b)^2 = a^2 - 2ab + b^2$",
      "3. $a^2 - b^2 = (a-b)(a+b)$",
      "4. $(a\\pm b)^3 = a^3 \\pm 3a^2b + 3ab^2 \\pm b^3$",
      "5. $a^3 \\pm b^3 = (a\\pm b)(a^2 \\mp ab + b^2)$",
    ].join("\n");
  }

  if (lower.includes("lượng giác")) {
    return [
      "**Công thức lượng giác cơ bản:**",
      "$$\\sin^2 x + \\cos^2 x = 1, \\qquad 1 + \\tan^2 x = \\frac{1}{\\cos^2 x}$$",
      "$$\\sin(2x) = 2\\sin x\\cos x, \\qquad \\cos(2x) = \\cos^2 x - \\sin^2 x$$",
    ].join("\n\n");
  }

  // 2. Tính đạo hàm ký hiệu
  if (
    lower.includes("đạo hàm") ||
    lower.includes("d/dx") ||
    lower.includes("f'(x)")
  ) {
    const expr = raw
      .replace(/tính|đạo hàm|của|hàm số|y\s*=|f\(x\)\s*=|d\/dx/gi, "")
      .trim();
    if (expr) {
      try {
        const deriv = derivative(expr, "x");
        const simplified = simplify(deriv);
        return [
          "**Kết quả đạo hàm theo biến $x$:**",
          `$$\\frac{d}{dx}\\left(${parse(expr).toTex()}\\right) = ${simplified.toTex()}$$`,
        ].join("\n");
      } catch {
        return "Chưa đọc được biểu thức đạo hàm. Hãy nhập theo mẫu: `Đạo hàm x^3 - 3x^2 + 2x` hoặc `Đạo hàm sin(2x)`.";
      }
    }
  }

  // 3. Giải phương trình bậc nhất & bậc hai (chứa dấu "=")
  if (raw.includes("=")) {
    const eq = raw
      .replace(/giải|phương trình|pt|tìm x/gi, "")
      .replace(/\s+/g, "");
    const parts = eq.split("=");
    if (parts.length === 2 && parts[0] && parts[1]) {
      try {
        const exprStr = `(${parts[0]}) - (${parts[1]})`;
        const f0 = Number(evaluate(exprStr, { x: 0 }));
        const f1 = Number(evaluate(exprStr, { x: 1 }));
        const fNeg1 = Number(evaluate(exprStr, { x: -1 }));
        const f2 = Number(evaluate(exprStr, { x: 2 }));

        const c = f0;
        const a = (f1 + fNeg1 - 2 * c) / 2;
        const b = (f1 - fNeg1) / 2;

        if (
          Number.isFinite(a) &&
          Number.isFinite(b) &&
          Number.isFinite(c) &&
          Math.abs(f2 - (4 * a + 2 * b + c)) < 1e-7
        ) {
          if (Math.abs(a) < 1e-9) {
            if (Math.abs(b) < 1e-9) {
              return Math.abs(c) < 1e-9
                ? "Phương trình có **vô số nghiệm** với mọi $x \\in \\mathbb{R}$."
                : "Phương trình **vô nghiệm**.";
            }
            const root = Number((-c / b).toFixed(4));
            const cSign = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
            return [
              "**Giải phương trình bậc nhất:**",
              `Đưa về dạng chuẩn: $${b}x ${cSign} = 0$`,
              `$$\\Rightarrow x = \\frac{${-c}}{${b}} = ${root}$$`,
            ].join("\n");
          } else {
            const delta = Number((b * b - 4 * a * c).toFixed(4));
            const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
            const cSign = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
            const lines = [
              `**Giải phương trình bậc hai:** $${a}x^2 ${bSign}x ${cSign} = 0$`,
              `Bước 1: Tính biệt thức $\\Delta = b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${delta}$`,
            ];
            if (delta < 0) {
              lines.push(
                "Bước 2: Vì $\\Delta < 0$ nên phương trình **vô nghiệm thực**."
              );
            } else if (Math.abs(delta) < 1e-9) {
              const x0 = Number((-b / (2 * a)).toFixed(4));
              lines.push(
                `Bước 2: Vì $\\Delta = 0$ nên phương trình có nghiệm kép:\n$$x_1 = x_2 = -\\frac{b}{2a} = ${x0}$$`
              );
            } else {
              const x1 = Number(
                ((-b + Math.sqrt(delta)) / (2 * a)).toFixed(4)
              );
              const x2 = Number(
                ((-b - Math.sqrt(delta)) / (2 * a)).toFixed(4)
              );
              lines.push(
                `Bước 2: Vì $\\Delta > 0$ nên phương trình có 2 nghiệm phân biệt:\n$$x_1 = \\frac{${-b} + \\sqrt{${delta}}}{${2 * a}} = ${x1}, \\qquad x_2 = \\frac{${-b} - \\sqrt{${delta}}}{${2 * a}} = ${x2}$$`
              );
            }
            return lines.join("\n\n");
          }
        }
      } catch {
        // Fallback below
      }
    }
  }

  // 4. Rút gọn biểu thức đại số
  if (lower.startsWith("rút gọn")) {
    const expr = raw.replace(/rút gọn|biểu thức/gi, "").trim();
    try {
      const s = simplify(expr);
      return `**Kết quả rút gọn:**\n$$${parse(expr).toTex()} = ${s.toTex()}$$`;
    } catch {
      // ignore
    }
  }

  // 5. Tính toán biểu thức số học / lượng giác
  const calcExpr = raw
    .replace(/tính|giá trị|bằng bao nhiêu|là gì|\?/gi, "")
    .trim();
  if (calcExpr) {
    try {
      const res = evaluate(calcExpr);
      if (typeof res === "number" && Number.isFinite(res)) {
        const val = Number(res.toFixed(6));
        return `**Kết quả tính toán:**\n$$${parse(calcExpr).toTex()} = ${val}$$`;
      }
    } catch {
      // ignore
    }
  }

  return [
    "Tôi chưa nhận diện được dạng toán này ở chế độ tính toán cục bộ. Bạn có thể nhập theo các mẫu sau:",
    "- `Giải 2x^2 - 5x + 2 = 0` (Phương trình bậc 1, bậc 2)",
    "- `Đạo hàm x^3 - 3x^2 + 5x` (Tính đạo hàm hàm số)",
    "- `Tính sqrt(144) + 2^5 - sin(pi/6)` (Tính biểu thức)",
    "- `Công thức Vi-ét` hoặc `Hằng đẳng thức`",
  ].join("\n");
}
