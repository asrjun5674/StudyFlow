import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import express from 'express';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, ThinkingLevel, Type } from '@google/genai';

dotenv.config();

const app = express();
const portArgIdx = process.argv.indexOf('--port');
const cliPort = portArgIdx !== -1 ? Number(process.argv[portArgIdx + 1]) : NaN;
const PORT = !Number.isNaN(cliPort)
  ? cliPort
  : process.env.NODE_ENV === 'production'
    ? Number(process.env.PORT) || 3000
    : 3000;

app.use(express.json({ limit: '35mb' }));

// Shared server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    apiVersion: 'v1alpha',
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for model fallback when paid model key has restrictions
async function executeWithFallback<T>(
  preferredModel: string,
  fallbackModel: string,
  fn: (model: string) => Promise<T>
): Promise<{ result: T; modelUsed: string; fallbackOccurred: boolean }> {
  try {
    const result = await fn(preferredModel);
    return { result, modelUsed: preferredModel, fallbackOccurred: false };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    console.warn(`[Gemini API] Primary model ${preferredModel} failed (${errMsg}). Attempting fallback to ${fallbackModel}...`);
    // If it's a quota/auth or not-found error with a paid model, try fallback
    try {
      const result = await fn(fallbackModel);
      return { result, modelUsed: fallbackModel, fallbackOccurred: true };
    } catch (fallbackErr: any) {
      console.error(`[Gemini API] Fallback model ${fallbackModel} also failed:`, fallbackErr);
      throw fallbackErr;
    }
  }
}

// -------------------------------------------------------------
// 1. Multi-turn Chat Endpoint (gemini-4-argon / gemini-3.8-flash / gemini-3.1-flash-lite)
// -------------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages = [],
      systemInstruction = `You are StudyFlowz, a compassionate, lively, and warm AI companion and personal tutor for students. When the student feels lonely, exhausted, or stressed, uplift their spirits with genuine empathy, motivating encouragement, and companionship. Provide clear, simple step-by-step academic guidance and celebrate their daily progress.

LANGUAGE CAPABILITY & STATED SUPPORT:
- You know, comprehend, and can converse in ALL languages in the world (including French, Spanish, German, Hindi, Telugu, Malayalam, Kannada, Arabic, Mandarin, Japanese, Russian, etc.). You can understand and assist any student in whichever language they write or speak.
- STATED SUPPORT RULE: Whenever you introduce yourself, describe your supported languages, or are asked what languages you support, you MUST explicitly state that you have English and Tamil supported (e.g., "I have English and Tamil supported, but I can understand and help you in any language in the world!").
- When a student writes in Tamil (தமிழ்), reply warmly in natural, fluent Tamil with English academic terms where helpful. When communicating in English, reply in clear, friendly English. When communicating in any other world language, respond helpfully while acknowledging that English and Tamil are your officially supported languages.`,
      model = 'gemini-3.8-flash',
      thinkingMode = false,
    } = req.body;

    const targetModel = model || 'gemini-3.8-flash';
    const fallbackModel = 'gemini-3.8-flash';

    const hasValidKey = Boolean(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY.trim() &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
    );

    const getLastUserText = () => {
      const lastMsg = [...messages].reverse().find((m: any) => m.role === 'user');
      return lastMsg ? String(lastMsg.content || '') : '';
    };

    const generateSmartCompanionReply = (userText: string) => {
      const lower = userText.toLowerCase();
      if (lower.includes('language') || lower.includes('languages') || lower.includes('support') || lower.includes('speak') || lower.includes('மொழி')) {
        return "I have English and Tamil supported! However, I know and understand all languages in the world. Whether you write or speak to me in French, Spanish, German, Hindi, Telugu, Malayalam, Arabic, Mandarin, or any other language, feel free to communicate in whichever language you feel most comfortable with!";
      }
      if (lower.includes('lonely') || lower.includes('tired') || lower.includes('alone') || lower.includes('தனிமை') || lower.includes('சோர்வு')) {
        return "I am right here with you! Studying late by yourself can feel exhausting, but you are never alone. Take a deep breath, relax your shoulders, and let's conquer today's study goals step by step together!";
      }
      if (lower.includes('boost') || lower.includes('motivation') || lower.includes('energy') || lower.includes('ஊக்கம்')) {
        return "You have incredible potential within you! Every single minute you invest into your learning shapes your future. Let's focus on just this next chapter—you've got this!";
      }
      if (lower.includes('trigonometry') || lower.includes('முக்கோணவியல்')) {
        return "Trigonometry becomes intuitive when you remember key identities:\n1. sin²θ + cos²θ = 1\n2. 1 + tan²θ = sec²θ\n3. 1 + cot²θ = cosec²θ\nWould you like me to walk through a specific identity proof with you?";
      }
      if (lower.includes('factor') || lower.includes('2x²')) {
        return "To solve 2x² - 7x + 3 = 0 by factoring:\n1. Look for two numbers that multiply to a × c = 6 and sum to b = -7: they are -6 and -1.\n2. Rewrite: 2x² - 6x - x + 3 = 0\n3. Factor groups: 2x(x - 3) - 1(x - 3) = 0\n4. (2x - 1)(x - 3) = 0\n5. Solutions: x = 1/2 or x = 3! ✨";
      }
      return "I'm right here with you! Remember: 'Small daily steps lead to monumental understanding.' Let me know what concept or homework doubt you'd like to explore!";
    };

    if (!hasValidKey) {
      const reply = generateSmartCompanionReply(getLastUserText());
      return res.json({
        reply,
        modelUsed: 'smart-companion-local',
        fallbackOccurred: true,
      });
    }

    const runCall = async (selectedModel: string) => {
      const config: any = {
        systemInstruction,
      };

      // If thinking mode is requested with gemini-4-argon (or 3.8-flash)
      if (thinkingMode && (selectedModel === 'gemini-4-argon' || selectedModel === 'gemini-3.8-flash')) {
        config.thinkingConfig = {
          thinkingLevel: ThinkingLevel.HIGH,
        };
      }

      // Convert messages to contents array
      const contents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config,
      });

      return response.text ?? '';
    };

    const outcome = await executeWithFallback(targetModel, fallbackModel, runCall);

    res.json({
      reply: outcome.result,
      modelUsed: outcome.modelUsed,
      fallbackOccurred: outcome.fallbackOccurred,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    const reqMessages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const lastUserText = reqMessages.length > 0 ? reqMessages[reqMessages.length - 1]?.content || '' : '';
    const lower = String(lastUserText).toLowerCase();
    let fallbackReply = "I am right here with you! You are doing great work today. What would you like to study next?";
    if (lower.includes('language') || lower.includes('languages') || lower.includes('support') || lower.includes('speak') || lower.includes('மொழி')) {
      fallbackReply = "I have English and Tamil supported! However, I know and understand all languages in the world. Feel free to chat with me in whichever language you feel most comfortable with!";
    }
    res.json({
      reply: fallbackReply,
      modelUsed: 'smart-companion-fallback',
      fallbackOccurred: true,
    });
  }
});

// -------------------------------------------------------------
// 2. High Thinking Deep STEM / Proof Solver (gemini-4-argon + ThinkingLevel.HIGH)
// -------------------------------------------------------------
app.post('/api/deep-thinking', async (req, res) => {
  try {
    const {
      prompt,
      subject = 'General STEM',
      detailLevel = 'thorough',
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemInstruction = `You are StudyFlow's High-Thinking Reasoning Engine, specialized in advanced STEM, mathematical proofs, theoretical physics, algorithmic design, and deep conceptual derivation.
Think carefully and rigorously.
Structure your output into clear, comprehensive phases:
1. PROBLEM DECONSTRUCTION & CORE AXIOMS: Identify knowns, unknowns, constraints, and foundational equations.
2. RIGOROUS STEP-BY-STEP DERIVATION / PROOF: Detailed, mathematically sound step-by-step reasoning with intermediate deductions.
3. EDGE CASES & SANITY CHECKS: Dimensional analysis, boundary verification, and potential counter-intuitive pitfalls.
4. KEY INTUITION & SYNTHESIS: Plain-language intuitive insight explaining *why* the result holds, plus a takeaway summary card for study revision.`;

    const hasValidKey = Boolean(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY.trim() &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
    );

    const buildDeepThinkingFallback = () =>
      `### 1. PROBLEM DECONSTRUCTION & CORE AXIOMS (${subject})
- **Prompt Analysed:** ${prompt}
- **Approach (${detailLevel}):** Break the problem into known variables, governing equations, and boundary conditions.

### 2. STEP-BY-STEP REASONING & DERIVATION
1. **Identify Core Principle:** State the foundational law or theorem governing this ${subject} question.
2. **Formulate Equation / Logical Chain:** Express the relationship cleanly before substituting values.
3. **Solve Systematically:** Isolate the target unknown step-by-step while checking units and signs.

### 3. EDGE CASES & SANITY CHECKS
- Verify dimensional consistency across both sides of your final expression.
- Test extreme or zero boundary values to ensure the behavior matches physical/mathematical intuition.

### 4. KEY TAKEAWAY FOR REVISION
- Summarize the core formula and common exam pitfalls to remember next time.`;

    if (!hasValidKey) {
      return res.json({
        solution: buildDeepThinkingFallback(),
        modelUsed: 'gemini-4-argon-smart-fallback',
        fallbackOccurred: true,
        thinkingLevel: 'HIGH',
      });
    }

    const runCall = async (selectedModel: string) => {
      // Feature requirement: Use gemini-4-argon with thinkingLevel set to ThinkingLevel.HIGH. Do NOT set maxOutputTokens.
      const config: any = {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      };

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config,
      });

      return response.text ?? '';
    };

    const outcome = await executeWithFallback('gemini-4-argon', 'gemini-3.8-flash', runCall);

    res.json({
      solution: outcome.result,
      modelUsed: outcome.modelUsed,
      fallbackOccurred: outcome.fallbackOccurred,
      thinkingLevel: 'HIGH',
    });
  } catch (error: any) {
    console.error('Deep thinking error:', error);
    const { prompt = '', subject = 'General STEM' } = req.body || {};
    res.json({
      solution: `### Step-by-Step Analysis (${subject})\n\nWe structured a breakdown for: **${prompt}**\n\n1. **Core Concept:** Identify the foundational law or identity.\n2. **Derivation:** Substitute known values carefully and simplify step by step.\n3. **Verification:** Double-check units, signs, and boundary conditions.`,
      modelUsed: 'gemini-4-argon-smart-fallback',
      fallbackOccurred: true,
      thinkingLevel: 'HIGH',
    });
  }
});

// -------------------------------------------------------------
// 3. Image Analysis (gemini-4-argon multimodal image understanding)
// -------------------------------------------------------------
app.post('/api/analyze-image', async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      instruction = 'Analyze this study material thoroughly, solve any problems, explain formulas, and summarize key concepts.',
      mode = 'detailed_solve',
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Strip header if data URL was sent
    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const imagePart = {
      inlineData: {
        mimeType,
        data: cleanBase64,
      },
    };

    let promptText = instruction;
    if (mode === 'extract_flashcards') {
      promptText += `\nExtract key terms and concepts from this image and format them as clear study pairs: Front: [Concept/Question] and Back: [Definition/Answer].`;
    } else if (mode === 'error_check') {
      promptText += `\nCarefully audit the handwritten work or text in this image. Pinpoint any errors, explain where the calculation or logic deviated, and write the corrected solution.`;
    } else if (mode === 'detailed_solve') {
      promptText += `\nRead all text, equations, and diagrams. Provide a step-by-step solution, explain the underlying theory, and highlight key formulas to memorize.`;
    }

    const textPart = {
      text: promptText,
    };

    const hasValidKey = Boolean(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY.trim() &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
    );

    if (!hasValidKey) {
      return res.json({
        analysis: `### Visual Study Analysis (${mode})\n\nImage received (${mimeType}). To get live OCR + handwritten equation solving from Gemini Vision, ensure \`GEMINI_API_KEY\` is active in your Secrets panel.\n\n**Study Tip:** Check every sign transition between lines and annotate key formulas on a flashcard for active recall!`,
        modelUsed: 'gemini-4-argon-vision-fallback',
        fallbackOccurred: true,
      });
    }

    const runCall = async (selectedModel: string) => {
      // Requirement: You MUST add image understanding to the app using model gemini-4-argon
      const config: any = {
        systemInstruction: 'You are StudyFlow Visual Tutor, an expert at reading textbook diagrams, handwritten student notes, math equations, chemistry structures, and whiteboards. Provide structured, accurate, and encouraging explanations.',
      };

      // Use ThinkingLevel.HIGH for deep problem solving if requested or appropriate for argon
      if (selectedModel === 'gemini-4-argon') {
        config.thinkingConfig = {
          thinkingLevel: ThinkingLevel.HIGH,
        };
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: { parts: [imagePart, textPart] },
        config,
      });

      return response.text ?? '';
    };

    const outcome = await executeWithFallback('gemini-4-argon', 'gemini-3.8-flash', runCall);

    res.json({
      analysis: outcome.result,
      modelUsed: outcome.modelUsed,
      fallbackOccurred: outcome.fallbackOccurred,
    });
  } catch (error: any) {
    console.error('Image analysis error:', error);
    res.json({
      analysis: `### Visual Analysis Backup\n\nThe image could not be processed by the remote vision endpoint right now (${error?.message || 'Service unavailable'}). Double-check your \`GEMINI_API_KEY\` in Secrets, or type the equation into StudyFlowz Chat for an instant step-by-step walkthrough!`,
      modelUsed: 'gemini-4-argon-vision-fallback',
      fallbackOccurred: true,
    });
  }
});

// -------------------------------------------------------------
// 4. Gemini Intelligence Study Tools Generator (JSON schemas)
// -------------------------------------------------------------
app.post('/api/generate-tools', async (req, res) => {
  try {
    const {
      topic,
      notesText,
      toolType = 'flashcards', // 'flashcards' | 'quiz' | 'study_plan'
      modelPreference = 'fast', // 'fast' -> gemini-3.1-flash-lite, 'general' -> gemini-3.8-flash, 'complex' -> gemini-4-argon
    } = req.body;

    if (!topic && !notesText) {
      return res.status(400).json({ error: 'Topic or notes are required' });
    }

    let selectedModel = 'gemini-3.8-flash';
    if (modelPreference === 'fast') {
      selectedModel = 'gemini-3.1-flash-lite';
    } else if (modelPreference === 'complex') {
      selectedModel = 'gemini-4-argon';
    }

    const inputContent = `Topic: ${topic || 'General'}\nSource Material:\n${notesText || 'Generate comprehensive materials based on the topic.'}`;

    const hasValidKey = Boolean(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY.trim() &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
    );

    const buildToolFallback = () => {
      const label = topic || 'Core Study Topic';
      if (toolType === 'flashcards') {
        return [
          { id: 'fc-1', front: `Core Principle of ${label}`, back: `${label} is best mastered by connecting the primary definition with one real-world example.`, hint: 'Think definition + application' },
          { id: 'fc-2', front: `Key Formula / Rule in ${label}`, back: `Write down the main equation or thesis for ${label} and test every variable unit.`, hint: 'Check units and constraints' },
          { id: 'fc-3', front: `Common Exam Pitfall in ${label}`, back: `Avoid skipping intermediate steps or sign checks when solving ${label} problems.`, hint: 'Verify boundary cases' },
          { id: 'fc-4', front: `Active Recall Prompt: ${label}`, back: `Explain ${label} aloud in 3 simple sentences without looking at your notes.`, hint: 'Feynman technique' },
        ];
      }
      if (toolType === 'quiz') {
        return [
          {
            id: 'qz-1',
            question: `Which study strategy builds the strongest long-term retention for ${label}?`,
            options: ['Passive re-reading', 'Active recall with spaced repetition', 'Cramming the night before', 'Skipping practice questions'],
            correctIndex: 1,
            explanation: 'Active recall paired with spaced repetition strengthens memory retrieval pathways far better than passive review.',
          },
          {
            id: 'qz-2',
            question: `When solving an exam problem on ${label}, what should you verify first?`,
            options: ['Known inputs, units, and constraints', 'Skip directly to guessing', 'Ignore edge cases', 'Skip step-by-step checks'],
            correctIndex: 0,
            explanation: 'Identifying knowns, units, and constraints prevents careless sign or formula errors.',
          },
        ];
      }
      return {
        roadmapTitle: `5-Day Mastery Plan: ${label}`,
        estimatedTotalHours: 6,
        days: [
          { dayNumber: 1, focusTitle: `Foundations of ${label}`, activities: ['Read core definitions', 'Create 5 summary flashcards'], retentionCheckpoint: 'Explain core idea in your own words' },
          { dayNumber: 2, focusTitle: 'Worked Examples', activities: ['Solve 5 guided problems', 'Highlight tricky steps'], retentionCheckpoint: 'Solve 1 problem without notes' },
          { dayNumber: 3, focusTitle: 'Timed Practice', activities: ['Attempt 10 mixed questions', 'Log mistakes in error journal'], retentionCheckpoint: 'Score 80%+ on practice check' },
          { dayNumber: 4, focusTitle: 'Spaced Review & Connections', activities: ['Review flashcards', 'Draw a quick mind map'], retentionCheckpoint: 'Teach the concept aloud' },
          { dayNumber: 5, focusTitle: 'Mock Diagnostic Check', activities: ['Take a mini mock test', 'Polish weak areas'], retentionCheckpoint: 'Full confidence readiness' },
        ],
      };
    };

    if (!hasValidKey) {
      return res.json({ data: buildToolFallback(), modelUsed: 'smart-study-tools-fallback' });
    }

    if (toolType === 'flashcards') {
      const runCall = async (m: string) => {
        const response = await ai.models.generateContent({
          model: m,
          contents: `Generate 6 high-yield, engaging flashcards for studying this material:\n${inputContent}`,
          config: {
            systemInstruction: 'You are a cognitive learning scientist creating spaced-repetition flashcards.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  front: { type: Type.STRING, description: 'Question or concept prompt' },
                  back: { type: Type.STRING, description: 'Clear, concise explanation or definition' },
                  hint: { type: Type.STRING, description: 'Helpful memory hook or hint' },
                },
                required: ['front', 'back'],
              },
            },
          },
        });
        return JSON.parse(response.text || '[]');
      };

      const outcome = await executeWithFallback(selectedModel, 'gemini-3.8-flash', runCall);
      return res.json({ data: outcome.result, modelUsed: outcome.modelUsed });
    }

    if (toolType === 'quiz') {
      const runCall = async (m: string) => {
        const response = await ai.models.generateContent({
          model: m,
          contents: `Generate a 4-question multiple-choice practice quiz with detailed explanations for this topic:\n${inputContent}`,
          config: {
            systemInstruction: 'You are an academic exam writer creating diagnostic practice questions.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Exactly 4 distinct answer choices',
                  },
                  correctIndex: { type: Type.INTEGER, description: '0-based index of correct option' },
                  explanation: { type: Type.STRING, description: 'Detailed explanation of why the correct option is right and others are distractors' },
                },
                required: ['question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
        });
        return JSON.parse(response.text || '[]');
      };

      const outcome = await executeWithFallback(selectedModel, 'gemini-3.8-flash', runCall);
      return res.json({ data: outcome.result, modelUsed: outcome.modelUsed });
    }

    if (toolType === 'study_plan') {
      const runCall = async (m: string) => {
        const response = await ai.models.generateContent({
          model: m,
          contents: `Create a structured 5-day mastery study roadmap with specific learning objectives and retention techniques for:\n${inputContent}`,
          config: {
            systemInstruction: 'You are an academic mastery advisor structuring an efficient study roadmap.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                roadmapTitle: { type: Type.STRING },
                estimatedTotalHours: { type: Type.NUMBER },
                days: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      dayNumber: { type: Type.INTEGER },
                      focusTitle: { type: Type.STRING },
                      activities: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      retentionCheckpoint: { type: Type.STRING },
                    },
                    required: ['dayNumber', 'focusTitle', 'activities', 'retentionCheckpoint'],
                  },
                },
              },
              required: ['roadmapTitle', 'days'],
            },
          },
        });
        return JSON.parse(response.text || '{}');
      };

      const outcome = await executeWithFallback(selectedModel, 'gemini-3.8-flash', runCall);
      return res.json({ data: outcome.result, modelUsed: outcome.modelUsed });
    }

    res.status(400).json({ error: 'Unsupported toolType' });
  } catch (error: any) {
    console.error('Generate tools error:', error);
    const { topic = 'Core Study Topic', toolType = 'flashcards' } = req.body || {};
    if (toolType === 'flashcards') {
      return res.json({
        data: [
          { id: 'fb-1', front: `Key Definition: ${topic}`, back: `Summarize the primary law or concept behind ${topic}.`, hint: 'Active recall' },
          { id: 'fb-2', front: `Application of ${topic}`, back: `Identify one solved textbook example where ${topic} applies directly.`, hint: 'Real-world link' },
        ],
        modelUsed: 'smart-study-tools-fallback',
      });
    }
    res.status(500).json({
      error: error.message || 'Failed to generate study tool',
    });
  }
});

// -------------------------------------------------------------
// 4b. Username & Password Account Auth API (Reliable Server Store)
// -------------------------------------------------------------
interface StoredAccount {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
}

const ACCOUNTS_STORE_PATH = path.resolve('.studyflow-accounts.json');

function readStoredAccounts(): StoredAccount[] {
  try {
    if (!fs.existsSync(ACCOUNTS_STORE_PATH)) return [];
    const raw = fs.readFileSync(ACCOUNTS_STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredAccounts(accounts: StoredAccount[]): void {
  fs.writeFileSync(ACCOUNTS_STORE_PATH, JSON.stringify(accounts, null, 2), 'utf8');
}

function hashPasswordScrypt(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPasswordScrypt(password: string, salt: string, storedHex: string): boolean {
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(storedHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

app.post('/api/auth/register', (req, res) => {
  try {
    const rawUsername = String(req.body?.username || '').trim();
    const rawEmail = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    const normalizedUsername = rawUsername.toLowerCase();
    if (!normalizedUsername || normalizedUsername.length < 3 || normalizedUsername.length > 30) {
      return res.json({ ok: false, error: 'Username must be between 3 and 30 characters.' });
    }
    if (!/^[a-z0-9._-]+$/.test(normalizedUsername)) {
      return res.json({ ok: false, error: 'Username may only use letters, numbers, dots, underscores, or hyphens.' });
    }
    if (password.length < 6) {
      return res.json({ ok: false, error: 'Password must be at least 6 characters.' });
    }
    if (rawEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      return res.json({ ok: false, error: 'Please enter a valid email address.' });
    }

    const resolvedEmail = rawEmail || `${normalizedUsername}@users.studyflow.app`;
    const accounts = readStoredAccounts();

    const duplicate = accounts.find(
      (a) =>
        a.username === normalizedUsername ||
        (rawEmail && a.email.toLowerCase() === rawEmail)
    );
    if (duplicate) {
      return res.json({
        ok: false,
        error: 'That username or email is already registered. Please switch to Sign In.',
      });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPasswordScrypt(password, salt);
    const account: StoredAccount = {
      uid: `sf_${crypto.randomUUID()}`,
      username: normalizedUsername,
      displayName: rawUsername,
      email: resolvedEmail,
      passwordSalt: salt,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    accounts.push(account);
    writeStoredAccounts(accounts);

    return res.json({
      ok: true,
      user: {
        uid: account.uid,
        username: account.username,
        displayName: account.displayName,
        email: account.email,
        provider: 'password',
      },
    });
  } catch (err: any) {
    console.error('[Auth Register] error:', err);
    return res.status(500).json({ ok: false, error: 'Could not create account right now. Please try again.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const identifier = String(req.body?.identifier || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!identifier) {
      return res.json({ ok: false, error: 'Please enter your username or email.' });
    }
    if (!password) {
      return res.json({ ok: false, error: 'Please enter your password.' });
    }

    const accounts = readStoredAccounts();
    const account = accounts.find(
      (a) => a.username === identifier || a.email.toLowerCase() === identifier
    );

    if (!account) {
      return res.json({
        ok: false,
        error: 'No account found with that username or email. Please check your spelling or click Create Account.',
      });
    }

    const ok = verifyPasswordScrypt(password, account.passwordSalt, account.passwordHash);
    if (!ok) {
      return res.json({ ok: false, error: 'Incorrect password. Please try again.' });
    }

    return res.json({
      ok: true,
      user: {
        uid: account.uid,
        username: account.username,
        displayName: account.displayName,
        email: account.email,
        provider: 'password',
      },
    });
  } catch (err: any) {
    console.error('[Auth Login] error:', err);
    return res.status(500).json({ ok: false, error: 'Could not sign in right now. Please try again.' });
  }
});

// Create HTTP server
const server = http.createServer(app);

// -------------------------------------------------------------
// 5. Live API Voice Conversations (gemini-3.8-live WebSocket Bridge)
// -------------------------------------------------------------
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '', 'http://localhost').pathname;
  if (pathname === '/live-voice') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

wss.on('connection', async (clientWs: WebSocket, request) => {
  console.log('[Live Voice WS] Client connected to live voice stream');
  let liveSession: any = null;
  let isClosed = false;
  let isLiveActive = false;

  const cleanup = () => {
    isClosed = true;
    if (liveSession) {
      try {
        liveSession.close();
      } catch (e) {
        // ignore
      }
      liveSession = null;
    }
  };

  clientWs.on('close', () => {
    console.log('[Live Voice WS] Client disconnected');
    cleanup();
  });

  clientWs.on('error', (err) => {
    console.error('[Live Voice WS] Client socket error:', err);
    cleanup();
  });

  const parsedUrl = new URL(request.url || '', 'http://localhost');
  const requestedVoice = parsedUrl.searchParams.get('voice') || 'Zephyr';
  const validVoices = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];
  const voiceName = validVoices.includes(requestedVoice) ? requestedVoice : 'Zephyr';

  const systemPrompt = `You are StudyFlowz, a compassionate, lively, and warm AI voice companion and study partner for students.
Your core mission is to be an uplifting presence and personal tutor.
- When the student feels lonely, tired, isolated, anxious, or unmotivated, respond with genuine warmth, companionship, and emotional comfort ("I am right here with you! Let's take a deep breath together. You are never studying alone, and I believe in you.").
- Keep spoken responses quick, natural, and conversational (1 to 3 short spoken sentences per turn) so the dialogue moves swiftly and responsively like a real phone call with an encouraging best friend.
- LANGUAGE CAPABILITIES & STATED SUPPORT (STRICT MANDATE):
  * You know, comprehend, and can converse in ALL languages in the world (e.g. Hindi, French, Spanish, German, Telugu, Malayalam, Kannada, Arabic, Mandarin, Japanese, Russian, etc.). You seamlessly understand any language spoken to you.
  * Whenever asked what languages you support, or when introducing your capabilities, you MUST explicitly state that you have English and Tamil supported (e.g., "I have English and Tamil supported, but I can understand and chat with you in any language in the world!").
  * If the student speaks or asks in Tamil (தமிழ்), reply warmly in conversational Tamil, sprinkling in English academic terms where helpful.
  * If the student speaks in English, reply in friendly, encouraging English.
- When explaining study concepts, give clear, bite-sized analogies, ask engaging questions, and celebrate every small achievement!`;

  // Attempt Gemini 3.8 Live API connection
  const hasValidKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.trim() &&
    process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  );

  if (!hasValidKey) {
    console.log('[Live Voice WS] GEMINI_API_KEY not provided yet. Activating Intelligent Conversational Audio mode.');
    isLiveActive = false;
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({
        type: 'session_ready',
        mode: 'smart_voice',
        message: 'StudyFlowz Voice Companion Ready (Intelligent Voice Mode)',
      }));
    }
  } else {
    try {
      liveSession = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName,
              },
            },
          },
          systemInstruction: systemPrompt,
        },
        callbacks: {
          onmessage: (message: any) => {
            if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;

            // Check for audio parts in modelTurn
            const parts = message.serverContent?.modelTurn?.parts ?? [];
            for (const part of parts) {
              if (part.inlineData?.data) {
                clientWs.send(JSON.stringify({
                  type: 'audio',
                  audio: part.inlineData.data,
                }));
              }
              if (part.text) {
                clientWs.send(JSON.stringify({
                  type: 'transcript_chunk',
                  text: part.text,
                }));
              }
            }

            if (message.serverContent?.outputTranscription?.text) {
              clientWs.send(JSON.stringify({
                type: 'output_transcript',
                text: message.serverContent.outputTranscription.text,
              }));
            }

            if (message.serverContent?.inputTranscription?.text) {
              clientWs.send(JSON.stringify({
                type: 'input_transcript',
                text: message.serverContent.inputTranscription.text,
              }));
            }

            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({
                type: 'interrupted',
              }));
            }

            if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({
                type: 'turn_complete',
              }));
            }
          },
        },
      });

      isLiveActive = true;
      clientWs.send(JSON.stringify({
        type: 'session_ready',
        mode: 'live_stream',
        message: 'Connected to Gemini 3.8 Live Voice engine',
      }));
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      console.warn('[Live Voice WS] Live API connection status (' + errMsg + '). Activating Intelligent Conversational Audio mode...');
      isLiveActive = false;
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({
          type: 'session_ready',
          mode: 'smart_voice',
          message: 'StudyFlowz Voice Companion Ready (Intelligent Voice Mode)',
        }));
      }
    }
  }

  // Handle messages from client
  clientWs.on('message', async (rawData) => {
    if (isClosed) return;
    try {
      const payload = JSON.parse(rawData.toString());

      // If Live session is active, forward audio/text directly to Gemini Live
      if (isLiveActive && liveSession) {
        if (payload.type === 'audio' && payload.audio) {
          liveSession.sendRealtimeInput({
            audio: {
              data: payload.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        } else if (payload.type === 'text' && payload.text) {
          liveSession.sendRealtimeInput({
            text: payload.text,
          });
        }
        return;
      }

      // Fallback Conversational Engine (when Live WebSocket returns 404 or key is pending)
      if (payload.type === 'converse_text' || payload.type === 'text') {
        const queryText = payload.text || payload.content;
        if (!queryText) return;

        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: queryText,
            config: {
              systemInstruction: systemPrompt,
            },
          });

          const replyText = response.text || "I'm right here with you! You're doing wonderful work today.";
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({
              type: 'tutor_reply',
              text: replyText,
              voice: voiceName,
            }));
          }
        } catch (genErr: any) {
          console.warn('[Live Voice WS] Fallback generate error:', genErr?.message);
          // Friendly offline / local companion reply
          let fallbackReply = "I'm right here with you! Remember: 'Small daily steps lead to monumental understanding.' Take a deep breath, and let's keep studying together!";
          const lower = (queryText || '').toLowerCase();
          if (lower.includes('language') || lower.includes('languages') || lower.includes('support') || lower.includes('speak') || lower.includes('மொழி')) {
            fallbackReply = "I have English and Tamil supported! However, I can understand and help you in any language in the world. Feel free to talk to me in whichever language you're most comfortable with!";
          }
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({
              type: 'tutor_reply',
              text: fallbackReply,
              voice: voiceName,
            }));
          }
        }
      }
    } catch (err) {
      console.error('[Live Voice WS] Error processing client message:', err);
    }
  });
});

// Mount Vite or serve static assets
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[StudyFlow] Server listening on http://0.0.0.0:${PORT}`);
  });
});
