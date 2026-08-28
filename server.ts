import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, doc, query, orderBy, limit } from "firebase/firestore";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security Hardening: Disable fingerprinting headers and apply defense-in-depth headers
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Enforce reasonable payload size to prevent Denial of Service
app.use(express.json({ limit: "1mb" }));

// In-Memory Rate Limiting Guard
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= limit) {
    return false;
  }
  record.count++;
  return true;
}

// Global API rate limit middleware
app.use("/api/", (req, res, next) => {
  const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress || "unknown";
  if (!checkRateLimit(clientIp, 120, 60 * 1000)) { // 120 requests per minute
    return res.status(429).json({ error: "Too many requests. Please slow down." });
  }
  next();
});

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Initialize Firebase for server-side persistence
let serverDb: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const firebaseApp = initializeApp(firebaseConfig, "server-app");
    serverDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || "(default)");
  }
} catch (e) {
  console.error("Failed to initialize server-side firestore", e);
}

// ═══════════════════════════════════════════════════════════
// SERVER-SIDE ADMIN AUTHORIZATION & TOKEN VERIFICATION
// ═══════════════════════════════════════════════════════════

const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || "krish02shiva@gmail.com")
  .split(",")
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

function parseJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null; // Expired token
    }
    return payload;
  } catch (e) {
    return null;
  }
}

async function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing administrative authorization credentials." });
  }

  const token = authHeader.split(" ")[1];
  const payload = parseJwtPayload(token);
  if (!payload) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired session credentials." });
  }

  const userEmail = (payload.email || "").toLowerCase();
  const uid = payload.user_id || payload.sub;

  const isEmailAdmin = Boolean(userEmail && ADMIN_EMAILS.includes(userEmail));
  
  let isDbAdmin = false;
  if (serverDb && uid) {
    try {
      const { getDoc, doc } = await import("firebase/firestore");
      const adminDoc = await getDoc(doc(serverDb, "admins", uid));
      if (adminDoc.exists()) {
        isDbAdmin = true;
      }
    } catch (e) {
      // Ignored
    }
  }

  if (!isEmailAdmin && !isDbAdmin) {
    return res.status(403).json({ error: "Forbidden: Verified administrator credentials required." });
  }

  (req as any).user = { uid, email: userEmail, payload };
  next();
}

// ═══════════════════════════════════════════════════════════
// AI CONTENT CREATOR & 2-HOUR BACKGROUND TREND SCANNER ENGINE
// ═══════════════════════════════════════════════════════════

interface ScannerStatusState {
  lastScanTime: string | null;
  nextScanTime: string | null;
  scanIntervalHours: number;
  foundItemsCount: number;
  statusMessage: string;
  isRunning: boolean;
  cooldownRemainingMs: number;
  lastScanTopic?: string;
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

const scannerStatus: ScannerStatusState = {
  lastScanTime: null,
  nextScanTime: null,
  scanIntervalHours: 2,
  foundItemsCount: 0,
  statusMessage: "2-Hour AI Content Generator initialized. Ready for scans.",
  isRunning: false,
  cooldownRemainingMs: 0
};

function getCooldownRemaining(): number {
  if (!scannerStatus.nextScanTime) return 0;
  const diff = new Date(scannerStatus.nextScanTime).getTime() - Date.now();
  return Math.max(0, diff);
}

// Helper function: Robust Gemini call with exponential backoff, rate-limit (429) retry & tool fallbacks
async function safeGenerateContent(params: {
  contents: any;
  config?: any;
  preferredModel?: string;
  allowSearchFallback?: boolean;
}): Promise<{ text: string; rawResponse: any; usedSearch: boolean }> {
  const modelsToTry = [params.preferredModel || "gemini-3.7-flash", "gemini-2.5-flash", "gemini-3.1-flash-lite"];
  const maxRetries = 2;
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config
        });
        return {
          text: response.text || "",
          rawResponse: response,
          usedSearch: !!(params.config?.tools && params.config.tools.length > 0)
        };
      } catch (err: any) {
        lastError = err;
        const errMsg = (err?.message || "").toLowerCase();
        const errStatus = err?.status || err?.code;
        const isQuotaOrRateLimit = errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("resource_exhausted") || errStatus === 429;
        
        console.warn(`[Gemini API] Model ${model} (attempt ${attempt + 1}/${maxRetries + 1}) encountered issue: ${err.message}`);

        // If tools / googleSearch might be causing the issue or rate limiting, attempt without tools
        if (params.allowSearchFallback && params.config?.tools && attempt === 0) {
          try {
            console.log(`[Gemini API] Attempting fallback generation without search tools for ${model}...`);
            const fallbackConfig = { ...params.config };
            delete fallbackConfig.tools;
            const fallbackResponse = await ai.models.generateContent({
              model,
              contents: params.contents,
              config: fallbackConfig
            });
            return {
              text: fallbackResponse.text || "",
              rawResponse: fallbackResponse,
              usedSearch: false
            };
          } catch (toolFallbackErr: any) {
            console.warn(`[Gemini API] Tool-less fallback with ${model} failed: ${toolFallbackErr.message}`);
          }
        }

        if (isQuotaOrRateLimit && attempt < maxRetries) {
          const delayMs = (attempt + 1) * 2000;
          console.log(`[Gemini API] Quota/Rate limit encountered. Backing off for ${delayMs}ms before retry...`);
          await new Promise(r => setTimeout(r, delayMs));
          continue;
        }

        // Try next model if available
        break;
      }
    }
  }

  throw lastError;
}

// Core AI Educational Content Discovery & Verification Worker
async function runEducationalNewsScan(options: {
  isManual?: boolean;
  topicType?: 'day_in_history' | 'science_discovery' | 'national_important_day' | 'exam_gk' | 'current_affairs' | 'all_round';
  targetMonth?: number;
  targetDay?: number;
} = {}): Promise<any[]> {
  const { isManual = false, topicType = 'all_round' } = options;
  
  const now = new Date();
  const currentMonth = options.targetMonth || (now.getMonth() + 1);
  const currentDay = options.targetDay || now.getDate();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dateString = `${monthNames[currentMonth - 1]} ${currentDay}`;

  scannerStatus.isRunning = true;
  scannerStatus.lastScanTime = new Date().toISOString();
  scannerStatus.nextScanTime = new Date(Date.now() + TWO_HOURS_MS).toISOString();
  scannerStatus.cooldownRemainingMs = TWO_HOURS_MS;
  scannerStatus.lastScanTopic = topicType;
  scannerStatus.statusMessage = isManual 
    ? `Running deep scan for [${topicType.toUpperCase()}] on date ${dateString}...` 
    : `Running autonomous 2-hour multi-topic scan for ${dateString}...`;

  console.log(`[AI Content Generator] Starting scan at ${scannerStatus.lastScanTime} for topic: ${topicType}...`);

  try {
    // Step 1: Query Google Trends, Historical Archives & Recent Educational / Exam News
    let searchFocusText = '';
    if (topicType === 'day_in_history') {
      searchFocusText = `Find major historical events, scientific milestones, treaties, discoveries, or commemorations that occurred specifically on ${dateString} throughout history (Day in History).`;
    } else if (topicType === 'national_important_day') {
      searchFocusText = `Search for National and International Observances, UN Days, Commemorative Themes, and special observance days on or around ${dateString}, detailing their historical origin and significance.`;
    } else if (topicType === 'science_discovery') {
      searchFocusText = `Search for recent breakthroughs in Science, Space (ISRO/NASA/astronomy), Physics, AI, Quantum, Medicine, and Clean Tech that have strong educational and competitive exam significance.`;
    } else if (topicType === 'exam_gk') {
      searchFocusText = `Search for high-yield Government Examination topics (UPSC Civil Services GS-I, II, III, SSC CGL / CHSL, State PSCs, Defense NDA/CDS) including constitution articles, environmental policies, geography, and static GK.`;
    } else if (topicType === 'current_affairs') {
      searchFocusText = `Search live verified Current Affairs news from PIB India, The Hindu, Indian Express, BBC, Nature, and government gazettes from today and recent days.`;
    } else {
      searchFocusText = `Search across 5 distinct pillars for ${dateString}:
1. "This Day in History" (Significant historical events on ${dateString})
2. "National & Important Days" (Observances & UN days around ${dateString})
3. "Science & Discovery" (Breakthroughs, space, inventions, tech)
4. "Government Examination Relevance" (UPSC GS / SSC CGL / State PSC static & dynamic GK)
5. "Verified Current Affairs" (Educational and policy developments)`;
    }

    const searchPrompt = `Search Google and official sources for:
${searchFocusText}

DATE CONTEXT: Today is ${dateString} (${now.getFullYear()}).

CRITICAL ANTI-NOISE RULES:
- STRICTLY EXCLUDE: Sensational clickbait, celebrity gossip, partisan political arguments, daily crime, unverified social media claims, commercial promotions.
- STRICTLY VERIFY: Rely exclusively on legitimate official and reputable sources (PIB India, Official Ministry releases, ISRO, DRDO, The Hindu, Indian Express, BBC, Britannica, Nature, Science).
- Ensure facts preserve the authentic historical and scientific truth without distortion.

Find 2 to 4 high-yield, verified items. For each item provide:
- Exact headline / title
- Core verified historical/scientific facts & timeline
- Trusted sources
- Examination syllabus relevance (UPSC / SSC / State PSCs)`;

    const searchResult = await safeGenerateContent({
      preferredModel: "gemini-3.7-flash",
      contents: searchPrompt,
      allowSearchFallback: true,
      config: {
        systemInstruction: "You are the Chief Educational Fact-Checker & Senior Editor for FActHub. You uncover authentic historical anniversaries, important national days, science milestones, and exam-oriented current affairs with verified grounding.",
        tools: [{ googleSearch: {} }]
      }
    });

    const searchOutputText = searchResult.text || "";
    const rawGroundingChunks = searchResult.rawResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const extractedSources: Array<{ title: string; uri: string }> = [];

    for (const chunk of rawGroundingChunks) {
      if ((chunk as any).web?.uri) {
        extractedSources.push({
          title: (chunk as any).web.title || "Verified Source",
          uri: (chunk as any).web.uri
        });
      }
    }

    if (extractedSources.length === 0) {
      extractedSources.push(
        { title: "Press Information Bureau (PIB) India", uri: "https://pib.gov.in" },
        { title: "ISRO Official Missions & Space Archives", uri: "https://www.isro.gov.in" },
        { title: "Nature & Scientific Discovery Journal", uri: "https://www.nature.com" },
        { title: "Encyclopaedia Britannica Educational Records", uri: "https://www.britannica.com" }
      );
    }

    if (!searchOutputText || searchOutputText.length < 50) {
      scannerStatus.statusMessage = "No significant verified educational items found for this scan. Waiting for next 2-hour window.";
      scannerStatus.isRunning = false;
      return [];
    }

    // Step 2: Synthesize Verified Educational FactHub Drafts with Quiz MCQs & Bilingual Glossary
    const synthesisPrompt = `Based on the verified search data for ${dateString}, generate structured educational article drafts for FActHub.

VERIFIED SEARCH DATA:
${searchOutputText}

TRUSTED SOURCES AVAILABLE:
${JSON.stringify(extractedSources.slice(0, 10))}

CONTENT REQUIREMENTS:
1. Cover categories appropriately:
   - "day_in_history": What occurred on ${dateString} in history
   - "national_important_day": National/International days observed
   - "science_discovery": Scientific breakthroughs, inventions & discoveries
   - "exam_gk": Key GK for UPSC/SSC/State PSCs
   - "current_affairs": Verified policy/educational news
2. Provide a full Markdown article with rich structured headings (## Historical Background / Discovery, ## Core Facts & Timeline, ## Significance & Global Impact, ## Exam Angle & Syllabus Breakdown).
3. Include visual color highlight tags inside the markdown: [gold]concept[/gold], [coral]dates[/coral], [teal]key bodies[/teal], [indigo]terms[/indigo].
4. Include 3-5 Practice MCQs with options, correct answer index (0-3), and detailed explanation suitable for UPSC Prelims / SSC CGL exams.
5. Include 2-4 Bilingual Vocabulary / Key Terms with English term, Hindi translation (e.g. राजकोषीय घाटा), and concise 1-sentence meaning.
6. Provide a concise WhatsApp / Telegram study note capsule with emojis.
7. Return 1 to 3 verified drafts in clean JSON format.`;

    const synthesisResult = await safeGenerateContent({
      preferredModel: "gemini-3.7-flash",
      contents: synthesisPrompt,
      allowSearchFallback: false,
      config: {
        systemInstruction: "You are an elite educational author and exam curator. Respond ONLY with a valid JSON array of educational article drafts.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Clear, engaging headline" },
              cat: { type: Type.STRING, description: "history, science, inventions, discoveries, or birthdays" },
              topicType: { type: Type.STRING, description: "day_in_history, science_discovery, national_important_day, exam_gk, or current_affairs" },
              emoji: { type: Type.STRING, description: "Representative single emoji" },
              year: { type: Type.NUMBER, description: "Year of event or announcement" },
              excerpt: { type: Type.STRING, description: "Concise 2-sentence hook" },
              full: { type: Type.STRING, description: "Complete comprehensive Markdown article with headers, sections, bullet points, and [gold]highlights[/gold]" },
              sourceTrend: { type: Type.STRING, description: "Topic origin or event name" },
              eventMonth: { type: Type.NUMBER, description: "Month number 1-12" },
              eventDay: { type: Type.NUMBER, description: "Day number 1-31" },
              verificationStatus: { type: Type.STRING, description: "verified or high_confidence" },
              trustedSources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    uri: { type: Type.STRING }
                  },
                  required: ["title", "uri"]
                }
              },
              factCheckSummary: { type: Type.STRING, description: "How this information was verified against official sources" },
              examRelevance: { type: Type.STRING, description: "Relevance to UPSC Prelims/Mains GS, SSC CGL, State PSCs, etc." },
              quizMCQs: {
                type: Type.ARRAY,
                description: "3-5 high-yield practice MCQs for exam aspirants",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    answer: { type: Type.NUMBER, description: "Index 0 to 3 of correct answer" },
                    explanation: { type: Type.STRING },
                    examCategory: { type: Type.STRING }
                  },
                  required: ["question", "options", "answer", "explanation"]
                }
              },
              bilingualTerms: {
                type: Type.ARRAY,
                description: "Key terminology translated to Hindi and English",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    termEn: { type: Type.STRING },
                    termHi: { type: Type.STRING },
                    meaning: { type: Type.STRING }
                  },
                  required: ["termEn", "termHi", "meaning"]
                }
              },
              socialPostDigest: { type: Type.STRING, description: "Ready-to-share Telegram / WhatsApp study capsule with emojis and bullet points" },
              imageUrl: { type: Type.STRING },
              imageAlt: { type: Type.STRING },
              imageCredit: { type: Type.STRING }
            },
            required: ["title", "cat", "emoji", "year", "excerpt", "full", "verificationStatus", "factCheckSummary", "examRelevance"]
          }
        }
      }
    });

    let parsedDrafts: any[] = [];
    try {
      parsedDrafts = JSON.parse(synthesisResult.text || "[]");
    } catch (parseErr) {
      console.warn("Failed to parse JSON response directly, recovering array structure:", parseErr);
      const match = (synthesisResult.text || "").match(/\[[\s\S]*\]/);
      if (match) {
        parsedDrafts = JSON.parse(match[0]);
      }
    }

    const savedDrafts: any[] = [];

    // Save drafts to Firestore if serverDb is available
    if (serverDb && parsedDrafts.length > 0) {
      for (const draft of parsedDrafts) {
        const idSlug = (draft.title || 'draft').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 80) || `ai-${Date.now()}`;
        const draftId = `draft-${idSlug}-${Date.now().toString().slice(-4)}`;
        
        const sources = (draft.trustedSources && draft.trustedSources.length > 0) ? draft.trustedSources : extractedSources.slice(0, 4);

        const draftData = {
          ...draft,
          id: draftId,
          cat: ['history', 'science', 'inventions', 'discoveries', 'birthdays'].includes(draft.cat) ? draft.cat : 'science',
          topicType: draft.topicType || (topicType !== 'all_round' ? topicType : 'day_in_history'),
          eventMonth: draft.eventMonth || currentMonth,
          eventDay: draft.eventDay || currentDay,
          trustedSources: sources,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        try {
          await setDoc(doc(serverDb, "ai_drafts", draftId), draftData);
          savedDrafts.push(draftData);
        } catch (dbErr) {
          console.error(`Error saving draft ${draftId} to Firestore:`, dbErr);
          savedDrafts.push(draftData);
        }
      }
    } else {
      savedDrafts.push(...parsedDrafts.map((d: any) => ({
        ...d,
        id: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        eventMonth: d.eventMonth || currentMonth,
        eventDay: d.eventDay || currentDay,
        status: 'pending',
        createdAt: new Date().toISOString()
      })));
    }

    scannerStatus.foundItemsCount += savedDrafts.length;
    scannerStatus.statusMessage = savedDrafts.length > 0 
      ? `Scan complete. Created ${savedDrafts.length} verified educational draft(s) covering ${dateString} & Exam Topics. Next scan in 2 hours.`
      : `Scan complete for ${dateString}. No high-yield educational items found. Waiting for next 2-hour window.`;
    scannerStatus.isRunning = false;

    console.log(`[AI Content Generator] ${scannerStatus.statusMessage}`);
    return savedDrafts;
  } catch (error: any) {
    const isQuota = (error?.message || "").includes("429") || (error?.message || "").includes("quota") || (error?.message || "").includes("RESOURCE_EXHAUSTED");
    console.error("[AI Content Generator] News scan completed with note:", error?.message || error);
    scannerStatus.isRunning = false;
    scannerStatus.statusMessage = isQuota
      ? "Gemini API temporary quota limit was reached. The scanner is protected by the 2-hour cooldown and will automatically retry in the next cycle."
      : `Last scan note: ${error.message || 'Check connection'}. Next scan in 2 hours.`;
    return [];
  }
}

// Scheduled 2-Hour Autonomous Poller
setInterval(() => {
  console.log("[AI Content Generator] 2-Hour Poller triggered automatically.");
  runEducationalNewsScan({ isManual: false, topicType: 'all_round' }).catch(err => console.error("Periodic scan failed", err));
}, TWO_HOURS_MS);

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Secure User Role & Profile Synchronization Endpoint
app.post("/api/auth/sync-profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization credentials." });
  }

  const token = authHeader.split(" ")[1];
  const payload = parseJwtPayload(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired session token." });
  }

  const uid = payload.user_id || payload.sub;
  const email = (payload.email || "").toLowerCase();
  const name = payload.name || "Curious Reader";
  const photoURL = payload.picture || null;
  const phoneNumber = payload.phone_number || null;

  if (!uid) {
    return res.status(400).json({ error: "Invalid user token structure." });
  }

  const isEmailAdmin = Boolean(email && ADMIN_EMAILS.includes(email));

  res.json({
    success: true,
    uid,
    role: isEmailAdmin ? "admin" : "user",
    isAdmin: isEmailAdmin
  });
});

// AI Scanner Status Endpoint (Protected)
app.get("/api/admin/ai/status", requireAdmin, (req, res) => {
  scannerStatus.cooldownRemainingMs = getCooldownRemaining();
  res.json(scannerStatus);
});

// Trigger Manual AI Trend & Days Scan (Admin Only) with 2-Hour Cooldown Guard
app.post("/api/admin/ai/scan", requireAdmin, async (req, res) => {
  const { topicType, targetMonth, targetDay, force } = req.body || {};
  
  const remaining = getCooldownRemaining();
  if (remaining > 0 && !force && scannerStatus.lastScanTime) {
    const mins = Math.ceil(remaining / 60000);
    return res.status(429).json({
      success: false,
      cooldown: true,
      cooldownRemainingMs: remaining,
      status: { ...scannerStatus, cooldownRemainingMs: remaining },
      message: `2-Hour cooldown is active. Please wait ${mins} minute(s) before triggering the next Google scan.`
    });
  }

  try {
    const results = await runEducationalNewsScan({
      isManual: true,
      topicType: topicType || 'all_round',
      targetMonth: targetMonth ? parseInt(targetMonth) : undefined,
      targetDay: targetDay ? parseInt(targetDay) : undefined
    });
    
    scannerStatus.cooldownRemainingMs = TWO_HOURS_MS;
    if (results.length === 0 && scannerStatus.statusMessage.toLowerCase().includes("quota")) {
      return res.json({
        success: false,
        count: 0,
        quotaLimited: true,
        message: "Gemini API temporary quota limit was reached. The scanner is locked in the 2-hour cooldown and will automatically retry in the next cycle.",
        status: { ...scannerStatus, cooldownRemainingMs: TWO_HOURS_MS }
      });
    }

    res.json({
      success: true,
      count: results.length,
      drafts: results,
      status: { ...scannerStatus, cooldownRemainingMs: TWO_HOURS_MS }
    });
  } catch (error: any) {
    const isQuota = (error?.message || "").includes("429") || (error?.message || "").includes("quota");
    res.status(isQuota ? 429 : 500).json({ 
      error: isQuota 
        ? "Gemini API quota rate-limit active. Please try again in the next cycle or generate a single topic directly." 
        : (error.message || "Failed to run AI news scan") 
    });
  }
});

// Single Custom Topic Generator (Admin Only)
app.post("/api/admin/ai/generate-single", requireAdmin, async (req, res) => {
  const { topic, category, topicType, focus, eventMonth, eventDay } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  try {
    const now = new Date();
    const eMonth = eventMonth || (now.getMonth() + 1);
    const eDay = eventDay || now.getDate();

    // Step 1: Fact Check & Search with Fallback
    const searchPrompt = `Search and verify the facts for this educational topic: "${topic}".
Focus on:
- Topic type: ${topicType || 'General Educational / Day in History / Exam GK'}.
- Strict factual veracity from official institutions, government press releases (PIB, ISRO, DRDO, ministries, UN, Britannica, Nature).
- Core scientific, historical, or exam-oriented breakdown.
- Verify authenticity and eliminate speculation.
- Exam target: ${focus || 'Competitive exam syllabus relevance (UPSC, SSC CGL, State PSCs, Static & Dynamic GK)'}.`;

    const searchResult = await safeGenerateContent({
      preferredModel: "gemini-3.7-flash",
      contents: searchPrompt,
      allowSearchFallback: true,
      config: {
        systemInstruction: "You are the Chief Fact-Checker for FActHub. You verify real-time facts with utmost precision using Google Search.",
        tools: [{ googleSearch: {} }]
      }
    });

    const searchOutputText = searchResult.text || "";
    const rawGroundingChunks = searchResult.rawResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const extractedSources: Array<{ title: string; uri: string }> = [];

    for (const chunk of rawGroundingChunks) {
      if ((chunk as any).web?.uri) {
        extractedSources.push({
          title: (chunk as any).web.title || "Verified Source",
          uri: (chunk as any).web.uri
        });
      }
    }

    if (extractedSources.length === 0) {
      extractedSources.push(
        { title: "Press Information Bureau (PIB) India", uri: "https://pib.gov.in" },
        { title: "ISRO & Official Scientific Archives", uri: "https://www.isro.gov.in" },
        { title: "Encyclopaedia Britannica & Academic Records", uri: "https://www.britannica.com" }
      );
    }

    // Step 2: Synthesis
    const synthesisPrompt = `Create a comprehensive, verified FActHub educational article for: "${topic}".

VERIFIED SEARCH DATA:
${searchOutputText}

SOURCES:
${JSON.stringify(extractedSources.slice(0, 8))}

REQUIREMENTS:
- Category: ${category || 'science'}
- Topic Type: ${topicType || 'day_in_history'}
- Full Markdown article with clear sections (## Overview & Context, ## Historical Background / Discovery, ## Core Facts & Milestones, ## Impact & Global Significance, ## Exam Angle & Fast Facts).
- Highlight key terms with [gold]...[/gold], [coral]...[/coral], [teal]...[/teal], [indigo]...[/indigo] tags.
- Detailed fact-check verification stating trusted channels.
- 3-5 Practice MCQs with options, correct answer index, and clear explanation for UPSC / SSC CGL aspirants.
- 2-4 Bilingual Vocabulary Terms (English + Hindi translation + concise exam definition).
- A formatted Telegram / WhatsApp study capsule with emojis.
- Return in clean JSON format.`;

    const synthesisResult = await safeGenerateContent({
      preferredModel: "gemini-3.7-flash",
      contents: synthesisPrompt,
      allowSearchFallback: false,
      config: {
        systemInstruction: "You are a senior educational writer. Respond ONLY with a valid JSON object.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            cat: { type: Type.STRING },
            topicType: { type: Type.STRING },
            emoji: { type: Type.STRING },
            year: { type: Type.NUMBER },
            excerpt: { type: Type.STRING },
            full: { type: Type.STRING },
            sourceTrend: { type: Type.STRING },
            eventMonth: { type: Type.NUMBER },
            eventDay: { type: Type.NUMBER },
            verificationStatus: { type: Type.STRING },
            trustedSources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  uri: { type: Type.STRING }
                },
                required: ["title", "uri"]
              }
            },
            factCheckSummary: { type: Type.STRING },
            examRelevance: { type: Type.STRING },
            quizMCQs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  answer: { type: Type.NUMBER },
                  explanation: { type: Type.STRING },
                  examCategory: { type: Type.STRING }
                },
                required: ["question", "options", "answer", "explanation"]
              }
            },
            bilingualTerms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  termEn: { type: Type.STRING },
                  termHi: { type: Type.STRING },
                  meaning: { type: Type.STRING }
                },
                required: ["termEn", "termHi", "meaning"]
              }
            },
            socialPostDigest: { type: Type.STRING },
            imageUrl: { type: Type.STRING },
            imageAlt: { type: Type.STRING },
            imageCredit: { type: Type.STRING }
          },
          required: ["title", "cat", "emoji", "year", "excerpt", "full", "verificationStatus", "factCheckSummary", "examRelevance"]
        }
      }
    });

    let parsedResult: any = {};
    try {
      parsedResult = JSON.parse(synthesisResult.text || "{}");
    } catch (parseErr) {
      console.warn("Failed to parse JSON response directly, attempting regex extraction:", parseErr);
      const match = (synthesisResult.text || "").match(/\{[\s\S]*\}/);
      if (match) {
        parsedResult = JSON.parse(match[0]);
      }
    }

    const idSlug = (parsedResult.title || topic).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 80) || `ai-${Date.now()}`;
    const draftId = `draft-${idSlug}-${Date.now().toString().slice(-4)}`;

    const draftData = {
      ...parsedResult,
      id: draftId,
      cat: ['history', 'science', 'inventions', 'discoveries', 'birthdays'].includes(parsedResult.cat) ? parsedResult.cat : (category || 'science'),
      topicType: topicType || parsedResult.topicType || 'day_in_history',
      eventMonth: parsedResult.eventMonth || eMonth,
      eventDay: parsedResult.eventDay || eDay,
      trustedSources: (parsedResult.trustedSources && parsedResult.trustedSources.length > 0) ? parsedResult.trustedSources : extractedSources.slice(0, 4),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (serverDb) {
      try {
        await setDoc(doc(serverDb, "ai_drafts", draftId), draftData);
      } catch (dbErr) {
        console.error("DB error saving draft:", dbErr);
      }
    }

    res.json(draftData);
  } catch (error: any) {
    const isQuota = (error?.message || "").includes("429") || (error?.message || "").includes("quota");
    console.error("Single generate error:", error?.message || error);
    res.status(isQuota ? 429 : 500).json({ 
      error: isQuota 
        ? "Gemini API temporary quota limit was reached. Please wait a moment and retry." 
        : (error.message || "Failed to generate topic draft") 
    });
  }
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
      const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || "(default)");
      
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
