import {
  Lecture,
  PdfDocument,
  QuizBank,
  QuizQuestion,
  QuizResult,
  UserAccount,
} from "../types";

export function computeGameLevel(xp: number): string {
  if (xp >= 1000) return "Cấp 5 · Kiện tướng";
  if (xp >= 600) return "Cấp 4 · Cao thủ";
  if (xp >= 400) return "Cấp 3 · Chinh phục";
  if (xp >= 200) return "Cấp 2 · Khám phá";
  return "Cấp 1 · Tập sự";
}

export const DEFAULT_USERS: UserAccount[] = [
  {
    username: "giaovien",
    email: "hoang.gv@mathmaster.edu.vn",
    password: "admin123",
    name: "Thầy Nguyễn Hoàng",
    role: "teacher",
    className: "Tổ Toán",
    xp: 1200,
    bestGame: 0,
    gameLevel: "Giáo viên",
    completedLectures: [],
  },
  {
    username: "hs01",
    email: "minhanh.12a1@mathmaster.edu.vn",
    password: "123456",
    name: "Nguyễn Minh Anh",
    role: "student",
    className: "12A1",
    xp: 480,
    bestGame: 150,
    gameLevel: computeGameLevel(480),
    completedLectures: ["lec1", "lec2"],
  },
  {
    username: "hs02",
    email: "quocbao.12a1@mathmaster.edu.vn",
    password: "123456",
    name: "Trần Quốc Bảo",
    role: "student",
    className: "12A1",
    xp: 390,
    bestGame: 120,
    gameLevel: computeGameLevel(390),
    completedLectures: ["lec1"],
  },
  {
    username: "hs03",
    email: "thaovy.12a2@mathmaster.edu.vn",
    password: "123456",
    name: "Lê Thảo Vy",
    role: "student",
    className: "12A2",
    xp: 640,
    bestGame: 190,
    gameLevel: computeGameLevel(640),
    completedLectures: ["lec1", "lec2", "lec3"],
  },
  {
    username: "hs04",
    email: "giahuy.12a2@mathmaster.edu.vn",
    password: "123456",
    name: "Phạm Gia Huy",
    role: "student",
    className: "12A2",
    xp: 310,
    bestGame: 90,
    gameLevel: computeGameLevel(310),
    completedLectures: ["lec2"],
  },
];

export const DEFAULT_RESULTS: QuizResult[] = [
  {
    id: "res-1",
    username: "hs03",
    name: "Lê Thảo Vy",
    className: "12A2",
    topic: "Đề 2: Phương trình bậc 2 & Hệ thức Vi-ét",
    correct: 4,
    total: 4,
    score: 10.0,
    time: "14/11 09:05",
    syncedToSheet: true,
  },
  {
    id: "res-2",
    username: "hs01",
    name: "Nguyễn Minh Anh",
    className: "12A1",
    topic: "Đề 1: Đạo hàm & Khảo sát hàm số",
    correct: 3,
    total: 4,
    score: 7.5,
    time: "14/11 08:15",
    syncedToSheet: true,
  },
  {
    id: "res-3",
    username: "hs02",
    name: "Trần Quốc Bảo",
    className: "12A1",
    topic: "Đề 1: Đạo hàm & Khảo sát hàm số",
    correct: 3,
    total: 4,
    score: 7.5,
    time: "13/11 19:40",
    syncedToSheet: false,
  },
];

export const DEFAULT_LECTURES: Lecture[] = [
  {
    id: "lec1",
    category: "Giải tích",
    grade: "Lớp 12",
    title: "Đạo hàm & Ứng dụng khảo sát hàm số",
    duration: "15 phút",
    summary:
      "Nắm vững định nghĩa giới hạn, bảng đạo hàm cơ bản, xét tính đơn điệu và tìm cực trị hàm số.",
    pdfTitle: "Chuyên đề Đạo hàm & Khảo sát hàm số (PDF)",
    pdfUrl: "https://arxiv.org/pdf/math/0404001",
    sections: [
      {
        heading: "1. Định nghĩa & Công thức đạo hàm cơ bản",
        body: "Đạo hàm của hàm số $y = f(x)$ tại điểm $x_0$ biểu thị tốc độ biến thiên tức thời của hàm số tại điểm đó:",
        formula:
          "$$f'(x_0) = \\lim_{\\Delta x \\to 0} \\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}$$",
        bullets: [
          "$(x^n)' = n \\cdot x^{n-1}$ với mọi $n \\in \\mathbb{N}^*$",
          "$(\\sqrt{x})' = \\frac{1}{2\\sqrt{x}}$ với $x > 0$",
          "$(\\sin x)' = \\cos x$, $\\quad (\\cos x)' = -\\sin x$",
          "$(e^x)' = e^x$, $\\quad (\\ln x)' = \\frac{1}{x}$ với $x > 0$",
        ],
      },
      {
        heading: "2. Tính đơn điệu và Cực trị của hàm số",
        body: "Cho hàm số $y = f(x)$ có đạo hàm trên khoảng $K$. Dấu của đạo hàm cấp một quyết định chiều biến thiên:",
        bullets: [
          "Nếu $f'(x) > 0, \\forall x \\in K$ thì hàm số **đồng biến** trên $K$.",
          "Nếu $f'(x) < 0, \\forall x \\in K$ thì hàm số **nghịch biến** trên $K$.",
          "Nếu $f'(x)$ đổi dấu từ dương sang âm khi qua $x_0$ thì $x_0$ là **điểm cực đại**.",
        ],
        example: {
          title: "Ví dụ minh họa: Tìm cực trị hàm bậc ba",
          content:
            "Xét $y = x^3 - 3x + 2$. Ta có $y' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. Lập bảng xét dấu $y'$ thu được cực đại tại $x = -1$ với $y_{\\text{CĐ}} = 4$ và cực tiểu tại $x = 1$ với $y_{\\text{CT}} = 0$.",
        },
      },
    ],
  },
  {
    id: "lec2",
    category: "Đại số",
    grade: "Lớp 10",
    title: "Phương trình bậc hai & Hệ thức Vi-ét",
    duration: "12 phút",
    summary:
      "Công thức nghiệm tổng quát, biệt thức Delta và ứng dụng tính tổng, tích hai nghiệm không cần giải trực tiếp.",
    pdfTitle: "Tài liệu Phương trình bậc 2 & Vi-ét (PDF)",
    pdfUrl: "https://arxiv.org/pdf/math/0404001",
    sections: [
      {
        heading: "1. Công thức nghiệm phương trình $ax^2 + bx + c = 0$ ($a \\neq 0$)",
        body: "Tính biệt thức $\\Delta = b^2 - 4ac$ (hoặc $\\Delta' = b'^2 - ac$ với $b = 2b'$):",
        bullets: [
          "Nếu $\\Delta < 0$: Phương trình vô nghiệm thực.",
          "Nếu $\\Delta = 0$: Phương trình có nghiệm kép $x_1 = x_2 = -\\frac{b}{2a}$.",
          "Nếu $\\Delta > 0$: Phương trình có 2 nghiệm phân biệt $x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$.",
        ],
      },
      {
        heading: "2. Định lý Vi-ét thuận & Mẹo nhẩm nghiệm",
        body: "Khi phương trình có 2 nghiệm $x_1, x_2$ (tức $\\Delta \\ge 0$), ta luôn có:",
        formula:
          "$$\\begin{cases} S = x_1 + x_2 = -\\dfrac{b}{a} \\\\[8pt] P = x_1 \\cdot x_2 = \\dfrac{c}{a} \\end{cases}$$",
        example: {
          title: "Mẹo nhẩm nghiệm nhanh",
          content:
            "Nếu $a + b + c = 0 \\Rightarrow x_1 = 1, \\; x_2 = \\frac{c}{a}$. Nếu $a - b + c = 0 \\Rightarrow x_1 = -1, \\; x_2 = -\\frac{c}{a}$.",
        },
      },
    ],
  },
  {
    id: "lec3",
    category: "Hình học",
    grade: "Lớp 12",
    title: "Tích vô hướng & Tọa độ Vectơ trong $Oxyz$",
    duration: "14 phút",
    summary:
      "Biểu thức tọa độ tích vô hướng, góc giữa hai vectơ, điều kiện vuông góc và độ dài đoạn thẳng.",
    sections: [
      {
        heading: "1. Phép toán tọa độ trong không gian $Oxyz$",
        body: "Cho hai vectơ $\\vec{u} = (x_1; y_1; z_1)$ và $\\vec{v} = (x_2; y_2; z_2)$:",
        formula:
          "$$\\vec{u} \\cdot \\vec{v} = x_1 x_2 + y_1 y_2 + z_1 z_2 \\qquad |\\vec{u}| = \\sqrt{x_1^2 + y_1^2 + z_1^2}$$",
        bullets: [
          "Hai vectơ vuông góc: $\\vec{u} \\perp \\vec{v} \\Leftrightarrow x_1 x_2 + y_1 y_2 + z_1 z_2 = 0$.",
          "Khoảng cách hai điểm $A, B$: $AB = \\sqrt{(x_B-x_A)^2 + (y_B-y_A)^2 + (z_B-z_A)^2}$.",
        ],
      },
      {
        heading: "2. Góc giữa hai vectơ",
        body: "Cosin của góc hợp bởi hai vectơ khác vectơ-không được tính theo công thức:",
        formula:
          "$$\\cos(\\vec{u}, \\vec{v}) = \\frac{\\vec{u} \\cdot \\vec{v}}{|\\vec{u}| \\cdot |\\vec{v}|} = \\frac{x_1 x_2 + y_1 y_2 + z_1 z_2}{\\sqrt{x_1^2+y_1^2+z_1^2}\\sqrt{x_2^2+y_2^2+z_2^2}}$$",
      },
    ],
  },
  {
    id: "lec4",
    category: "Xác suất",
    grade: "Lớp 11",
    title: "Hoán vị, Chỉnh hợp, Tổ hợp & Xác suất cổ điển",
    duration: "16 phút",
    summary:
      "Phân biệt chính xác $P_n, A_n^k, C_n^k$ trong các bài toán đếm và công thức xác suất biến cố.",
    sections: [
      {
        heading: "1. Ba quy tắc đếm cơ bản",
        body: "Phân biệt dựa trên hai yếu tố: có lấy hết phần tử không và có xét thứ tự hay không:",
        bullets: [
          "**Hoán vị** của $n$ phần tử: $P_n = n! = 1 \\cdot 2 \\cdots n$",
          "**Chỉnh hợp** chập $k$ của $n$ (có thứ tự): $A_n^k = \\frac{n!}{(n-k)!}$",
          "**Tổ hợp** chập $k$ của $n$ (không thứ tự): $C_n^k = \\binom{n}{k} = \\frac{n!}{k!(n-k)!}$",
        ],
      },
      {
        heading: "2. Định nghĩa xác suất cổ điển",
        body: "Với không gian mẫu hữu hạn $\\Omega$ gồm các kết quả đồng khả năng:",
        formula:
          "$$P(A) = \\frac{n(A)}{n(\\Omega)}, \\qquad 0 \\le P(A) \\le 1, \\qquad P(\\overline{A}) = 1 - P(A)$$",
        example: {
          title: "Ví dụ: Chọn ngẫu nhiên học sinh",
          content:
            "Một tổ có $6$ nam và $4$ nữ. Chọn ngẫu nhiên $3$ bạn, xác suất để chọn được đúng $2$ nam và $1$ nữ là $P = \\frac{C_6^2 \\cdot C_4^1}{C_{10}^3} = \\frac{15 \\cdot 4}{120} = \\frac{1}{2}$.",
        },
      },
    ],
  },
  {
    id: "lec5",
    category: "Giải tích",
    grade: "Lớp 12",
    title: "Nguyên hàm & Tích phân xác định",
    duration: "18 phút",
    summary:
      "Bảng nguyên hàm sơ cấp, công thức Newton-Leibniz và ứng dụng tính diện tích hình phẳng.",
    sections: [
      {
        heading: "1. Bảng nguyên hàm thường gặp",
        body: "Nếu $F'(x) = f(x)$ trên $K$ thì $\\int f(x)\\,dx = F(x) + C$:",
        bullets: [
          "$\\int x^\\alpha\\,dx = \\frac{x^{\\alpha+1}}{\\alpha+1} + C \\; (\\alpha \\neq -1)$",
          "$\\int \\frac{1}{x}\\,dx = \\ln|x| + C$",
          "$\\int \\cos x\\,dx = \\sin x + C, \\quad \\int \\sin x\\,dx = -\\cos x + C$",
        ],
      },
      {
        heading: "2. Công thức Newton - Leibniz",
        body: "Cho hàm số $f(x)$ liên tục trên $[a; b]$ và $F(x)$ là một nguyên hàm của $f(x)$ trên $[a; b]$:",
        formula: "$$\\int_a^b f(x)\\,dx = F(x)\\Big|_a^b = F(b) - F(a)$$",
      },
    ],
  },
];

export const DEFAULT_PDF_DOCUMENTS: PdfDocument[] = [
  {
    id: "pdf-1",
    title: "Tuyển tập 50 bài tập Đạo hàm & Khảo sát hàm số",
    category: "Giải tích",
    grade: "Lớp 12",
    description:
      "Hệ thống bài tập trắc nghiệm và tự luận từ cơ bản đến vận dụng cao có hướng dẫn giải chi tiết.",
    pdfUrl: "https://arxiv.org/pdf/math/0404001",
    uploadedBy: "Thầy Nguyễn Hoàng",
    createdAt: "14/11/2026",
  },
  {
    id: "pdf-2",
    title: "Sổ tay Công thức Toán THPT đầy đủ (LaTeX chuẩn)",
    category: "Tổng hợp",
    grade: "Lớp 10–12",
    description:
      "Tóm tắt toàn bộ công thức Đại số, Giải tích, Hình học Oxyz và Tổ hợp - Xác suất ôn thi.",
    pdfUrl: "https://arxiv.org/pdf/math/0404001",
    uploadedBy: "Thầy Nguyễn Hoàng",
    createdAt: "12/11/2026",
  },
  {
    id: "pdf-3",
    title: "Chuyên đề Phương trình bậc hai & Định lý Vi-ét",
    category: "Đại số",
    grade: "Lớp 10",
    description:
      "Các dạng toán tìm tham số m để phương trình có hai nghiệm thỏa mãn biểu thức đối xứng.",
    pdfUrl: "https://arxiv.org/pdf/math/0404001",
    uploadedBy: "Thầy Nguyễn Hoàng",
    createdAt: "10/11/2026",
  },
];

export const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    id: "q-1",
    topic: "Đề 1: Đạo hàm & Khảo sát hàm số",
    type: "trac_nghiem",
    q: "Tính đạo hàm của hàm số $y = x^3 - 3x^2 + 2x - 5$?",
    options: [
      "$y' = 3x^2 - 6x + 2$",
      "$y' = 3x^2 - 3x + 2$",
      "$y' = x^2 - 6x + 2$",
      "$y' = 3x^2 - 6x - 5$",
    ],
    answer: 0,
    explain:
      "Áp dụng $(x^n)' = n x^{n-1} \\Rightarrow y' = 3x^2 - 3(2x) + 2 = 3x^2 - 6x + 2$.",
  },
  {
    id: "q-2",
    topic: "Đề 1: Đạo hàm & Khảo sát hàm số",
    type: "trac_nghiem",
    q: "Hàm số $y = x^3 - 3x + 1$ đạt cực tiểu tại điểm nào?",
    options: ["$x = -1$", "$x = 1$", "$x = 0$", "$x = 2$"],
    answer: 1,
    explain:
      "$y' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. Vì $y'' = 6x$, tại $x = 1$ có $y''(1) = 6 > 0$ nên hàm số đạt cực tiểu tại $x = 1$.",
  },
  {
    id: "q-3",
    topic: "Đề 1: Đạo hàm & Khảo sát hàm số",
    type: "trac_nghiem",
    q: "Đạo hàm của hàm số $y = \\sin(2x)$ là:",
    options: [
      "$\\cos(2x)$",
      "$-2\\cos(2x)$",
      "$2\\cos(2x)$",
      "$2\\sin(2x)$",
    ],
    answer: 2,
    explain:
      "Áp dụng đạo hàm hàm hợp $(\\sin u)' = u' \\cos u \\Rightarrow y' = (2x)' \\cos(2x) = 2\\cos(2x)$.",
  },
  {
    id: "q-4",
    topic: "Đề 1: Đạo hàm & Khảo sát hàm số",
    type: "trac_nghiem",
    q: "Giá trị nhỏ nhất của hàm số $y = x + \\frac{4}{x}$ trên đoạn $[1; 3]$ bằng:",
    options: ["$5$", "$4$", "$\\frac{13}{3}$", "$3$"],
    answer: 1,
    explain:
      "Theo bất đẳng thức Cauchy với $x > 0$: $x + \\frac{4}{x} \\ge 2\\sqrt{x \\cdot \\frac{4}{x}} = 4$. Dấu bằng xảy ra tại $x = 2 \\in [1;3]$.",
  },
  {
    id: "q-5",
    topic: "Đề 2: Phương trình bậc 2 & Hệ thức Vi-ét",
    type: "trac_nghiem",
    q: "Tổng hai nghiệm của phương trình $2x^2 - 7x + 3 = 0$ là:",
    options: ["$-\\frac{7}{2}$", "$\\frac{3}{2}$", "$\\frac{7}{2}$", "$7$"],
    answer: 2,
    explain:
      "Ta có $\\Delta = 49 - 24 = 25 > 0$. Theo Vi-ét: $x_1 + x_2 = -\\frac{b}{a} = -\\frac{-7}{2} = \\frac{7}{2}$.",
  },
  {
    id: "q-6",
    topic: "Đề 2: Phương trình bậc 2 & Hệ thức Vi-ét",
    type: "trac_nghiem",
    q: "Phương trình $x^2 - 2(m+1)x + m^2 = 0$ có nghiệm kép khi $m$ bằng:",
    options: ["$m = -\\frac{1}{2}$", "$m = \\frac{1}{2}$", "$m = 1$", "$m = 0$"],
    answer: 0,
    explain:
      "Nghiệm kép $\\Leftrightarrow \\Delta' = (m+1)^2 - m^2 = 2m + 1 = 0 \\Leftrightarrow m = -\\frac{1}{2}$.",
  },
  {
    id: "q-7",
    topic: "Đề 2: Phương trình bậc 2 & Hệ thức Vi-ét",
    type: "trac_nghiem",
    q: "Cho $x_1, x_2$ là hai nghiệm của $x^2 - 5x + 6 = 0$. Tính giá trị $A = x_1^2 + x_2^2$:",
    options: ["$13$", "$25$", "$19$", "$37$"],
    answer: 0,
    explain:
      "$x_1 + x_2 = 5, \\; x_1 x_2 = 6 \\Rightarrow x_1^2 + x_2^2 = (x_1+x_2)^2 - 2x_1 x_2 = 25 - 12 = 13$.",
  },
  {
    id: "q-8",
    topic: "Đề 2: Phương trình bậc 2 & Hệ thức Vi-ét",
    type: "tu_luan",
    q: "Tìm tất cả các giá trị thực của tham số $m$ để phương trình $x^2 - 2mx + m^2 - 1 = 0$ có hai nghiệm phân biệt $x_1, x_2$ thỏa mãn $x_1^2 + x_2^2 = 10$.",
    options: [],
    answer: 0,
    essayAnswer: "m = 2 hoặc m = -2",
    explain:
      "Ta có $\\Delta' = m^2 - (m^2 - 1) = 1 > 0$ với mọi $m$. Theo Vi-ét: $x_1 + x_2 = 2m$ và $x_1 x_2 = m^2 - 1$. Khi đó $x_1^2 + x_2^2 = (x_1+x_2)^2 - 2x_1 x_2 = 4m^2 - 2(m^2-1) = 2m^2 + 2 = 10 \\Leftrightarrow m^2 = 4 \\Leftrightarrow m = \\pm 2$.",
  },
  {
    id: "q-9",
    topic: "Đề 3: Hình học Oxyz & Xác suất",
    type: "trac_nghiem",
    q: "Trong $Oxyz$, cho $\\vec{a} = (1; -2; 3)$ và $\\vec{b} = (2; 4; 2)$. Tích vô hướng $\\vec{a} \\cdot \\vec{b}$ bằng:",
    options: ["$0$", "$16$", "$-4$", "$6$"],
    answer: 0,
    explain:
      "$\\vec{a} \\cdot \\vec{b} = 1\\cdot 2 + (-2)\\cdot 4 + 3\\cdot 2 = 2 - 8 + 6 = 0$ (hai vectơ vuông góc).",
  },
  {
    id: "q-10",
    topic: "Đề 3: Hình học Oxyz & Xác suất",
    type: "trac_nghiem",
    q: "Số cách chọn $3$ học sinh từ một tổ có $10$ học sinh đi trực nhật là:",
    options: ["$A_{10}^3 = 720$", "$C_{10}^3 = 120$", "$3! = 6$", "$30$"],
    answer: 1,
    explain:
      "Việc chọn không phân biệt thứ tự nên số cách là tổ hợp $C_{10}^3 = \\frac{10 \\cdot 9 \\cdot 8}{3!} = 120$.",
  },
  {
    id: "q-11",
    topic: "Đề 3: Hình học Oxyz & Xác suất",
    type: "trac_nghiem",
    q: "Gieo một con xúc xắc cân đối $1$ lần. Xác suất để xuất hiện mặt có số chấm chẵn là:",
    options: ["$\\frac{1}{6}$", "$\\frac{1}{3}$", "$\\frac{1}{2}$", "$\\frac{2}{3}$"],
    answer: 2,
    explain:
      "Không gian mẫu $n(\\Omega)=6$. Các mặt chẵn $\\{2,4,6\\} \\Rightarrow n(A)=3 \\Rightarrow P(A) = \\frac{3}{6} = \\frac{1}{2}$.",
  },
];

export function buildQuizBanksFromQuestions(questions: QuizQuestion[]): QuizBank[] {
  const grouped = new Map<string, QuizQuestion[]>();
  questions.forEach((q) => {
    const key = q.topic || "Đề tổng hợp";
    const list = grouped.get(key) || [];
    list.push(q);
    grouped.set(key, list);
  });

  const banks: QuizBank[] = [];
  let idx = 1;
  grouped.forEach((qs, topic) => {
    banks.push({
      id: `bank-${idx++}`,
      title: topic,
      category: topic.includes("Đạo hàm")
        ? "Giải tích"
        : topic.includes("Vi-ét")
        ? "Đại số"
        : "Tổng hợp",
      timeMinutes: Math.max(5, qs.length * 2),
      level: qs.some((x) => x.type === "tu_luan") ? "Tổng hợp (TN + TL)" : "Trắc nghiệm",
      questions: qs,
    });
  });
  return banks;
}

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * MathMaster LMS - Google Apps Script Backend (Full Schema)
 * Quản lý 5 Sheet tự động:
 * 1. NguoiDung: ID_Username | HoTen | Email | MatKhau | VaiTro | Lop | DiemXP | KyLucGame | CapDoGame | BaiDaHoc
 * 2. LyThuyet: ID | ChuyenDe | KhoiLop | TieuDe | ThoiLuong | TomTat | NoiDungLaTeX | TenFilePDF | LinkTaiLieuPDF
 * 3. TaiLieuPDF: ID | TieuDe | ChuyenDe | KhoiLop | MoTa | LinkPDF | NguoiDang | NgayDang
 * 4. CauHoi: ID | DeThi_ChuDe | LoaiCauHoi | DeBai_LaTeX | DapAnA | DapAnB | DapAnC | DapAnD | DapAnDung | LoiGiaiChiTiet_LaTeX
 * 5. KetQua: ThoiGian | Username | HoTen | Lop | DeThi | SoCauDung | TongCau | DiemSo
 */

var HEADERS = {
  NguoiDung: ['ID_Username', 'HoTen', 'Email', 'MatKhau', 'VaiTro', 'Lop', 'DiemXP', 'KyLucGame', 'CapDoGame', 'BaiDaHoc'],
  LyThuyet: ['ID', 'ChuyenDe', 'KhoiLop', 'TieuDe', 'ThoiLuong', 'TomTat', 'NoiDungLaTeX', 'TenFilePDF', 'LinkTaiLieuPDF'],
  TaiLieuPDF: ['ID', 'TieuDe', 'ChuyenDe', 'KhoiLop', 'MoTa', 'LinkPDF', 'NguoiDang', 'NgayDang'],
  CauHoi: ['ID', 'DeThi_ChuDe', 'LoaiCauHoi', 'DeBai_LaTeX', 'DapAnA', 'DapAnB', 'DapAnC', 'DapAnD', 'DapAnDung', 'LoiGiaiChiTiet_LaTeX'],
  KetQua: ['ThoiGian', 'Username', 'HoTen', 'Lop', 'DeThi', 'SoCauDung', 'TongCau', 'DiemSo']
};

function getOrCreateSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    var headers = HEADERS[name];
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#e0e7ff');
    }
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function readUsers() {
  var sheet = getOrCreateSheet('NguoiDung');
  var rows = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var doneStr = String(rows[i][9] || '');
    list.push({
      username: String(rows[i][0]),
      name: String(rows[i][1]),
      email: String(rows[i][2]),
      password: String(rows[i][3] || '123456'),
      role: String(rows[i][4] || 'student'),
      className: String(rows[i][5] || ''),
      xp: Number(rows[i][6]) || 0,
      bestGame: Number(rows[i][7]) || 0,
      gameLevel: String(rows[i][8] || 'Cấp 1 · Tập sự'),
      completedLectures: doneStr ? doneStr.split(',').map(function(s){ return s.trim(); }).filter(Boolean) : []
    });
  }
  return list;
}

function readLectures() {
  var sheet = getOrCreateSheet('LyThuyet');
  var rows = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var rawContent = String(rows[i][6] || '');
    list.push({
      id: String(rows[i][0]),
      category: String(rows[i][1] || 'Giải tích'),
      grade: String(rows[i][2] || 'Lớp 12'),
      title: String(rows[i][3]),
      duration: String(rows[i][4] || '15 phút'),
      summary: String(rows[i][5] || ''),
      rawContent: rawContent,
      pdfTitle: String(rows[i][7] || ''),
      pdfUrl: String(rows[i][8] || ''),
      sections: [{ heading: 'Nội dung bài giảng', body: rawContent }]
    });
  }
  return list;
}

function readDocuments() {
  var sheet = getOrCreateSheet('TaiLieuPDF');
  var rows = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    list.push({
      id: String(rows[i][0]),
      title: String(rows[i][1]),
      category: String(rows[i][2] || 'Tổng hợp'),
      grade: String(rows[i][3] || 'Lớp 12'),
      description: String(rows[i][4] || ''),
      pdfUrl: String(rows[i][5] || ''),
      uploadedBy: String(rows[i][6] || 'Giáo viên'),
      createdAt: String(rows[i][7] || '')
    });
  }
  return list;
}

function readQuestions() {
  var sheet = getOrCreateSheet('CauHoi');
  var rows = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var qType = String(rows[i][2] || 'trac_nghiem');
    var ansRaw = rows[i][8];
    list.push({
      id: String(rows[i][0]),
      topic: String(rows[i][1] || 'Đề tổng hợp'),
      type: qType,
      q: String(rows[i][3]),
      options: qType === 'trac_nghiem'
        ? [String(rows[i][4]), String(rows[i][5]), String(rows[i][6]), String(rows[i][7])]
        : [],
      answer: qType === 'trac_nghiem' ? (Number(ansRaw) || 0) : 0,
      essayAnswer: qType === 'tu_luan' ? String(ansRaw || '') : '',
      explain: String(rows[i][9] || '')
    });
  }
  return list;
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';

  if (action === 'ping') {
    return jsonResponse({ status: 'ok', message: 'MathMaster Sheet Ready (5 Sheets)' });
  }
  if (action === 'getUsers' || action === 'getLeaderboard') {
    return jsonResponse({ status: 'ok', users: readUsers(), students: readUsers() });
  }
  if (action === 'getLectures') {
    return jsonResponse({ status: 'ok', lectures: readLectures() });
  }
  if (action === 'getDocuments') {
    return jsonResponse({ status: 'ok', documents: readDocuments() });
  }
  if (action === 'getQuestions') {
    return jsonResponse({ status: 'ok', questions: readQuestions() });
  }
  if (action === 'syncAll') {
    return jsonResponse({
      status: 'ok',
      users: readUsers(),
      lectures: readLectures(),
      documents: readDocuments(),
      questions: readQuestions()
    });
  }
  return jsonResponse({ status: 'error', message: 'Unknown action' });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    if (action === 'saveUser' || action === 'addStudent') {
      upsertUser(data.user || data.student);
      return jsonResponse({ status: 'ok' });
    }

    if (action === 'deleteUser') {
      deleteById('NguoiDung', data.username);
      return jsonResponse({ status: 'ok' });
    }

    if (action === 'updateScore') {
      updateUserScore(data.username, data.xp, data.bestGame, data.gameLevel, data.completedLectures);
      return jsonResponse({ status: 'ok' });
    }

    if (action === 'submitQuiz') {
      var r = data.record;
      var resSheet = getOrCreateSheet('KetQua');
      resSheet.appendRow([new Date(), r.username, r.name, r.className, r.topic, r.correct, r.total, r.score]);
      updateUserScore(r.username, data.xp, null, data.gameLevel, null);
      return jsonResponse({ status: 'ok' });
    }

    if (action === 'saveLecture') {
      var l = data.lecture;
      var bodyText = l.rawContent || (l.sections || []).map(function(s){ return s.heading + '\\n' + s.body; }).join('\\n\\n');
      upsertRow('LyThuyet', l.id, [l.id, l.category, l.grade, l.title, l.duration, l.summary, bodyText, l.pdfTitle || '', l.pdfUrl || '']);
      return jsonResponse({ status: 'ok' });
    }

    if (action === 'deleteLecture') {
      deleteById('LyThuyet', data.id);
      return jsonResponse({ status: 'ok' });
    }

    if (action === 'saveDocument') {
      var d = data.document;
      var pdfLink = d.pdfUrl || '';
      if (data.fileBase64 && data.fileName) {
        var blob = Utilities.newBlob(Utilities.base64Decode(data.fileBase64), 'application/pdf', data.fileName);
        var file = DriveApp.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        pdfLink = 'https://drive.google.com/file/d/' + file.getId() + '/view';
      }
      upsertRow('TaiLieuPDF', d.id, [d.id, d.title, d.category, d.grade, d.description, pdfLink, d.uploadedBy, d.createdAt]);
      return jsonResponse({ status: 'ok', pdfUrl: pdfLink });
    }

    if (action === 'deleteDocument') {
      deleteById('TaiLieuPDF', data.id);
      return jsonResponse({ status: 'ok' });
    }

    if (action === 'saveQuestion') {
      var q = data.question;
      var ansVal = q.type === 'tu_luan' ? (q.essayAnswer || '') : q.answer;
      upsertRow('CauHoi', q.id, [
        q.id, q.topic, q.type, q.q,
        (q.options && q.options[0]) || '',
        (q.options && q.options[1]) || '',
        (q.options && q.options[2]) || '',
        (q.options && q.options[3]) || '',
        ansVal, q.explain || ''
      ]);
      return jsonResponse({ status: 'ok' });
    }

    if (action === 'deleteQuestion') {
      deleteById('CauHoi', data.id);
      return jsonResponse({ status: 'ok' });
    }

    return jsonResponse({ status: 'error', message: 'Unsupported action' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function upsertRow(sheetName, id, rowValues) {
  var sheet = getOrCreateSheet(sheetName);
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.getRange(i + 1, 1, 1, rowValues.length).setValues([rowValues]);
      return;
    }
  }
  sheet.appendRow(rowValues);
}

function deleteById(sheetName, id) {
  var sheet = getOrCreateSheet(sheetName);
  var rows = sheet.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
    }
  }
}

function upsertUser(u) {
  var row = [
    u.username, u.name, u.email || '', u.password || '123456',
    u.role || 'student', u.className || '',
    u.xp || 0, u.bestGame || 0, u.gameLevel || 'Cấp 1 · Tập sự',
    (u.completedLectures || []).join(',')
  ];
  upsertRow('NguoiDung', u.username, row);
}

function updateUserScore(username, xp, bestGame, gameLevel, completedLectures) {
  var sheet = getOrCreateSheet('NguoiDung');
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(username)) {
      if (xp !== null && xp !== undefined) sheet.getRange(i + 1, 7).setValue(xp);
      if (bestGame !== null && bestGame !== undefined) sheet.getRange(i + 1, 8).setValue(bestGame);
      if (gameLevel) sheet.getRange(i + 1, 9).setValue(gameLevel);
      if (Array.isArray(completedLectures)) sheet.getRange(i + 1, 10).setValue(completedLectures.join(','));
      return;
    }
  }
}`;
