import http from 'node:http';
import path from 'node:path';
import express from 'express';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, ThinkingLevel, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '35mb' }));

// Shared server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
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
      systemInstruction = 'You are StudyFlowz, a compassionate, lively, and warm AI companion and personal tutor for students. When the student feels lonely, exhausted, or stressed, uplift their spirits with genuine empathy, motivating encouragement, and companionship. Provide clear, simple step-by-step academic guidance and celebrate their daily progress.',
      model = 'gemini-3.8-flash',
      thinkingMode = false,
    } = req.body;

    const targetModel = model || 'gemini-3.8-flash';
    const fallbackModel = 'gemini-3.8-flash';

    const runCall = async (selectedModel: string) => {
      const config: any = {
        systemInstruction,
      };

      // If thinking mode is requested with gemini-4-argon (or 3.8-flash)
      if (thinkingMode && (selectedModel === 'gemini-4-argon' || selectedModel === 'gemini-3.8-flash')) {
        config.thinkingConfig = {
          thinkingLevel: ThinkingLevel.HIGH,
        };
        // Per rules: Do NOT set maxOutputTokens or thinkingBudget
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
    res.status(500).json({
      error: error.message || 'Failed to generate chat response',
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
    res.status(500).json({
      error: error.message || 'Failed to complete deep reasoning analysis',
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
    res.status(500).json({
      error: error.message || 'Failed to analyze study image',
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
    res.status(500).json({
      error: error.message || 'Failed to generate study tool',
    });
  }
});

// Create HTTP server
const server = http.createServer(app);

// -------------------------------------------------------------
// 5. Live API Voice Conversations (gemini-3.8-live WebSocket Bridge)
// -------------------------------------------------------------
const wss = new WebSocketServer({ server, path: '/live-voice' });

wss.on('connection', async (clientWs: WebSocket, request) => {
  console.log('[Live Voice WS] Client connected to live voice stream');
  let liveSession: any = null;
  let isClosed = false;

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

  try {
    const parsedUrl = new URL(request.url || '', 'http://localhost');
    const requestedVoice = parsedUrl.searchParams.get('voice') || 'Zephyr';
    const validVoices = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];
    const voiceName = validVoices.includes(requestedVoice) ? requestedVoice : 'Zephyr';

    // Feature requirement: Use model gemini-3.8-live (Live API)
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
        systemInstruction: `You are StudyFlowz, a compassionate, lively, and warm AI voice companion and study partner for students.
Your core mission is to be an uplifting presence and personal tutor.
- When the student feels lonely, tired, isolated, anxious, or unmotivated, respond with genuine warmth, companionship, and emotional comfort ("I am right here with you! Let's take a deep breath together. You are never studying alone, and I believe in you.").
- Keep spoken responses quick, natural, and conversational (1 to 3 short spoken sentences per turn) so the dialogue moves swiftly and responsively like a real phone call with an encouraging best friend.
- If the student speaks or asks in Tamil (தமிழ்), reply warmly in conversational Tamil, sprinkling in English academic terms where helpful.
- When explaining study concepts, give clear, bite-sized analogies, ask engaging questions, and celebrate every small achievement!`,
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

    clientWs.send(JSON.stringify({
      type: 'session_ready',
      message: 'Connected to Gemini 3.8 Live Voice engine',
    }));

    // Forward mic audio PCM from client to Live session
    clientWs.on('message', (rawData) => {
      if (!liveSession || isClosed) return;
      try {
        const payload = JSON.parse(rawData.toString());
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
      } catch (err) {
        console.error('[Live Voice WS] Error processing client message:', err);
      }
    });
  } catch (error: any) {
    console.error('[Live Voice WS] Error connecting to Gemini Live API:', error);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({
        type: 'error',
        error: error.message || 'Failed to establish Gemini Live API connection',
      }));
    }
    cleanup();
  }
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
