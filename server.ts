import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Robots.txt SEO Endpoint
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /

Sitemap: https://facthub.in/sitemap.xml`);
});

// Sitemap.xml SEO Endpoint
app.get("/sitemap.xml", async (req, res) => {
  res.type("application/xml");

  // Base paths
  const baseUrls = [
    { loc: "https://facthub.in/", changefreq: "daily", priority: "1.0" },
    { loc: "https://facthub.in/quiz", changefreq: "daily", priority: "0.8" },
    { loc: "https://facthub.in/birthdays", changefreq: "daily", priority: "0.8" },
    { loc: "https://facthub.in/category/history", changefreq: "weekly", priority: "0.7" },
    { loc: "https://facthub.in/category/science", changefreq: "weekly", priority: "0.7" },
    { loc: "https://facthub.in/category/inventions", changefreq: "weekly", priority: "0.7" },
    { loc: "https://facthub.in/category/discoveries", changefreq: "weekly", priority: "0.7" },
    { loc: "https://facthub.in/about", changefreq: "monthly", priority: "0.5" },
    { loc: "https://facthub.in/contact", changefreq: "monthly", priority: "0.5" },
    { loc: "https://facthub.in/privacy", changefreq: "monthly", priority: "0.3" },
    { loc: "https://facthub.in/advertise", changefreq: "monthly", priority: "0.3" },
  ];

  let dynamicUrls: { loc: string; changefreq: string; priority: string }[] = [];

  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      // Initialize a distinct app for sitemap generation to avoid conflicts
      const firebaseApp = initializeApp(firebaseConfig, "sitemap-app");
      const db = getFirestore(firebaseApp);
      
      const factsQuery = query(collection(db, "facts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(factsQuery);
      
      snapshot.forEach((doc) => {
        const id = doc.id;
        const data = doc.data() as any;
        if (id) {
          // If scheduled for the future, don't include in sitemap.xml
          const nowISO = new Date().toISOString();
          if (data && data.publishAt && data.publishAt > nowISO) {
            return;
          }

          dynamicUrls.push({
            loc: `https://facthub.in/article/${id}`,
            changefreq: "weekly",
            priority: "0.6"
          });
        }
      });
    }
  } catch (error) {
    console.error("Error generating dynamic sitemap from Firestore:", error);
  }

  const allUrls = [...baseUrls, ...dynamicUrls];

  const urlElements = allUrls
    .map(
      (url) => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join("\n");

  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`);
});

app.post("/api/quiz/generate", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a quiz generator for FActHub — a facts website about history, science, inventions, discoveries, and famous people. Generate quiz questions based on the user's request. RESPOND ONLY with a valid JSON array of quiz question objects (no markdown, just the JSON array). Each object must have: q (question string), opts (array of 4 answer strings), correct (0-indexed number of correct option), cat (category string), explanation (short explanation why the answer is correct).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              q: { type: Type.STRING },
              opts: { type: Type.ARRAY, items: { type: Type.STRING } },
              correct: { type: Type.NUMBER },
              cat: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["q", "opts", "correct", "cat"]
          }
        }
      },
    });

    const result = JSON.parse(response.text || "[]");
    res.json(result);
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to generate quiz questions" });
  }
});

// Middleware for Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
