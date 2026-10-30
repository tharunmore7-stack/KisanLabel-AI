import type { ChatMessage, LabelAnalysis, AiMode, LanguageCode } from '@/types';
import { supabase, EDGE_FUNCTION_BASE } from './supabase';

interface ChatParams {
  question: string;
  analysis: LabelAnalysis | null;
  mode: AiMode;
  language: LanguageCode;
  history: ChatMessage[];
}

export async function askAssistant({
  question,
  analysis,
  mode,
  language,
}: ChatParams): Promise<string> {
  if (!analysis) {
    return 'Please scan a pesticide label first. I can only answer questions based on a scanned label.';
  }

  const labelContext = JSON.stringify(analysis, null, 2);

  if (mode === 'online') {
    if (!supabase || !EDGE_FUNCTION_BASE) {
      return 'Online AI is not available because the backend is not configured. Please switch to Offline AI mode.';
    }

    const res = await fetch(`${EDGE_FUNCTION_BASE}/gemini-analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        chat: true,
        question,
        labelContext,
        language,
      }),
    });

    if (!res.ok) return `Sorry, the AI service returned an error (${res.status}).`;
    const body = (await res.json()) as { answer?: string; error?: string };
    return body.answer ?? body.error ?? 'I could not generate an answer.';
  }

  // Offline: Ollama
  try {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma:2b',
        stream: false,
        prompt: `You are KisanLabel AI. Answer the farmer's question based ONLY on the scanned label context below.
Do not invent pesticide recommendations or dosage. If the answer is not in the context, say so.
Respond in language code "${language}".

LABEL CONTEXT (JSON):
${labelContext}

QUESTION: ${question}
ANSWER:`,
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) return 'Offline AI is not responding. Is Ollama running?';
    const data = (await res.json()) as { response?: string };
    return data.response ?? 'I could not generate an answer.';
  } catch {
    return 'Offline AI is not available. Is Ollama running on localhost:11434?';
  }
}
