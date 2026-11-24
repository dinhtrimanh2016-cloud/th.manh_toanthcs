import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.post("/api/chat", async (req, res) => {
  const { prompt, history } = req.body as {
    prompt?: string;
    history?: Array<{ role: "user" | "assistant"; text: string }>;
  };

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    res.status(400).json({ error: "Vui lòng nhập nội dung câu hỏi Toán học." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: "GEMINI_UNAVAILABLE",
      message: "Chưa cấu hình GEMINI_API_KEY trên máy chủ.",
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const contextMessages = (history || [])
      .slice(-6)
      .map((m) => `${m.role === "user" ? "Học sinh" : "Gia sư"}: ${m.text}`)
      .join("\n");

    const fullPrompt = contextMessages
      ? `${contextMessages}\nHọc sinh: ${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: fullPrompt,
      config: {
        systemInstruction:
          "Bạn là gia sư Toán học THPT & THCS tại Việt Nam tên là MathBot. Hãy giải thích ngắn gọn, chính xác, từng bước dễ hiểu bằng tiếng Việt. Luôn đặt công thức toán học trong cặp $...$ (công thức cùng dòng) hoặc $$...$$ (công thức riêng dòng) để KaTeX hiển thị sắc nét. Không bịa đặt kết quả.",
      },
    });

    const text = response.text;
    if (!text) {
      res.status(502).json({ error: "Không nhận được phản hồi từ Gemini AI." });
      return;
    }

    res.json({ text, source: "gemini" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi gọi Gemini AI";
    res.status(500).json({ error: "GEMINI_ERROR", message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MathMaster LMS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
