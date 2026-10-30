import type { LabelAnalysis, LabelImage, AiMode, LanguageCode } from '@/types';
import { runOcr } from './ocr';
import { supabase, EDGE_FUNCTION_BASE } from './supabase';

interface AnalyzeParams {
  images: LabelImage[];
  mode: AiMode;
  language: LanguageCode;
  onProgress?: (stage: string, pct: number) => void;
}

interface AnalysisResponse {
  analysis?: LabelAnalysis;
  extractedText?: string;
  error?: string;
  configured?: boolean;
  mode?: AiMode;
}

const EMPTY_ANALYSIS: LabelAnalysis = {
  productIdentification: {},
  cropPestInfo: { crops: [], pests: [] },
  dosage: { tankCapacityMentioned: false, unclearOrMissing: false },
  waitingPeriod: {},
  safetyInstructions: {
    protectiveEquipment: [],
    handlingPrecautions: [],
    storageInstructions: [],
    environmentalPrecautions: [],
    disposalInstructions: [],
    firstAid: [],
  },
  warnings: [],
  overallConfidence: 'missing',
  missingFields: [],
};

export const NOT_CONFIGURED_KEY = 'kisanlabel_gemini_not_configured';

export async function checkOllamaAvailable(): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(2500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function analyzeLabel({
  images,
  mode,
  language,
  onProgress,
}: AnalyzeParams): Promise<{ analysis: LabelAnalysis; rawText?: string; error?: string }> {
  onProgress?.('Preparing images…', 0.05);

  try {
    if (mode === 'online') {
      const result = await analyzeWithGemini(images, language, onProgress);
      return result;
    } else {
      const result = await analyzeWithOllama(images, language, onProgress);
      return result;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown analysis error';
    return { analysis: EMPTY_ANALYSIS, error: msg };
  }
}

async function analyzeWithGemini(
  images: LabelImage[],
  language: LanguageCode,
  onProgress?: (stage: string, pct: number) => void
): Promise<{ analysis: LabelAnalysis; rawText?: string; error?: string }> {
  if (!supabase || !EDGE_FUNCTION_BASE) {
    throw new Error('Supabase is not configured. Cannot reach the Gemini service.');
  }

  onProgress?.('Sending to Gemini AI…', 0.2);

  const payload = {
    images: images.map((i) => ({ dataUrl: i.dataUrl, mimeType: i.mimeType })),
    language,
  };

  const res = await fetch(`${EDGE_FUNCTION_BASE}/gemini-analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = `Gemini service error (${res.status})`;
    try {
      const body = (await res.json()) as AnalysisResponse;
      if (body.error) msg = body.error;
    } catch {
      /* ignore parse error */
    }
    throw new Error(msg);
  }

  onProgress?.('Reading AI response…', 0.85);
  const body = (await res.json()) as AnalysisResponse;

  if (body.error) throw new Error(body.error);

  const analysis = normalizeAnalysis(body.analysis);
  return { analysis, rawText: body.extractedText };
}

async function analyzeWithOllama(
  images: LabelImage[],
  language: LanguageCode,
  onProgress?: (stage: string, pct: number) => void
): Promise<{ analysis: LabelAnalysis; rawText?: string; error?: string }> {
  onProgress?.('Running local OCR…', 0.15);
  const rawText = await runOcr(
    images.map((i) => ({ dataUrl: i.dataUrl, mimeType: i.mimeType })),
    (pct) => onProgress?.('Running local OCR…', 0.15 + pct * 0.5)
  );

  onProgress?.('Asking local AI model…', 0.7);

  const prompt = buildOllamaPrompt(rawText, language);

  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemma:2b',
      prompt,
      stream: false,
      format: 'json',
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    throw new Error(`Ollama error (${res.status}). Is Ollama running with the gemma:2b model?`);
  }

  const data = (await res.json()) as { response?: string };
  onProgress?.('Reading AI response…', 0.9);

  let parsed: LabelAnalysis | null = null;
  try {
    parsed = JSON.parse(data.response ?? '') as LabelAnalysis;
  } catch {
    /* fallthrough to normalized empty */
  }

  const analysis = normalizeAnalysis(parsed ?? undefined);
  return { analysis, rawText };
}

export function normalizeAnalysis(raw?: Partial<LabelAnalysis>): LabelAnalysis {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_ANALYSIS };

  const base: LabelAnalysis = {
    productIdentification: {
      productName: str(raw.productIdentification?.productName),
      manufacturer: str(raw.productIdentification?.manufacturer),
      activeIngredient: str(raw.productIdentification?.activeIngredient),
      chemicalComposition: str(raw.productIdentification?.chemicalComposition),
      formulationType: str(raw.productIdentification?.formulationType),
      registrationNumber: str(raw.productIdentification?.registrationNumber),
    },
    cropPestInfo: {
      crops: arr(raw.cropPestInfo?.crops),
      pests: arr(raw.cropPestInfo?.pests),
      approvedUsage: str(raw.cropPestInfo?.approvedUsage),
      applicationMethod: str(raw.cropPestInfo?.applicationMethod),
    },
    dosage: {
      dosageInstructions: str(raw.dosage?.dosageInstructions),
      dosageUnits: str(raw.dosage?.dosageUnits),
      tankCapacity: str(raw.dosage?.tankCapacity),
      tankCapacityMentioned: Boolean(raw.dosage?.tankCapacityMentioned),
      explanation: str(raw.dosage?.explanation),
      unclearOrMissing: Boolean(raw.dosage?.unclearOrMissing),
    },
    waitingPeriod: {
      preHarvestInterval: str(raw.waitingPeriod?.preHarvestInterval),
      waitingPeriod: str(raw.waitingPeriod?.waitingPeriod),
      reEntryInterval: str(raw.waitingPeriod?.reEntryInterval),
      explanation: str(raw.waitingPeriod?.explanation),
    },
    safetyInstructions: {
      protectiveEquipment: arr(raw.safetyInstructions?.protectiveEquipment),
      handlingPrecautions: arr(raw.safetyInstructions?.handlingPrecautions),
      storageInstructions: arr(raw.safetyInstructions?.storageInstructions),
      environmentalPrecautions: arr(raw.safetyInstructions?.environmentalPrecautions),
      disposalInstructions: arr(raw.safetyInstructions?.disposalInstructions),
      firstAid: arr(raw.safetyInstructions?.firstAid),
    },
    warnings: (raw.warnings ?? []).filter(isValidWarning).map((w) => ({
      type: w.type,
      title: w.title,
      details: w.details,
      severity: w.severity === 'high' || w.severity === 'medium' ? w.severity : 'low',
    })),
    rawExtractedText: str(raw.rawExtractedText),
    overallConfidence:
      raw.overallConfidence === 'high' ||
      raw.overallConfidence === 'medium' ||
      raw.overallConfidence === 'low'
        ? raw.overallConfidence
        : 'missing',
    missingFields: arr(raw.missingFields),
  };

  // Auto-populate missing fields list
  if (base.missingFields.length === 0) {
    const missing: string[] = [];
    if (!base.productIdentification.productName) missing.push('Product name');
    if (!base.productIdentification.manufacturer) missing.push('Manufacturer');
    if (!base.productIdentification.activeIngredient) missing.push('Active ingredient');
    if (base.cropPestInfo.crops.length === 0) missing.push('Crops');
    if (!base.dosage.dosageInstructions) missing.push('Dosage instructions');
    if (!base.waitingPeriod.waitingPeriod && !base.waitingPeriod.preHarvestInterval)
      missing.push('Waiting period');
    base.missingFields = missing;
  }

  return base;
}

function str(v: unknown): string | undefined {
  if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  return undefined;
}

function arr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean);
}

function isValidWarning(w: unknown): w is {
  type: 'toxicity' | 'skin-eye' | 'environmental' | 'restricted' | 'missing-info';
  title: string;
  details: string;
  severity: 'high' | 'medium' | 'low';
} {
  if (!w || typeof w !== 'object') return false;
  const obj = w as Record<string, unknown>;
  return (
    typeof obj.title === 'string' &&
    typeof obj.details === 'string' &&
    ['toxicity', 'skin-eye', 'environmental', 'restricted', 'missing-info'].includes(obj.type as string)
  );
}

export function buildOllamaPrompt(rawText: string, language: LanguageCode): string {
  return `You are KisanLabel AI, an assistant that reads Indian pesticide product labels.
You are given OCR-extracted text from a pesticide label. Extract ONLY information present in the text.
NEVER invent dosage, tank capacity, mixing ratios, or crop recommendations.
If information is missing, leave it empty and add it to missingFields.
Preserve chemical names, product names, numbers and units exactly.

Return ONLY valid JSON matching this TypeScript type:
{
  "productIdentification": { "productName"?, "manufacturer"?, "activeIngredient"?, "chemicalComposition"?, "formulationType"?, "registrationNumber"? },
  "cropPestInfo": { "crops": string[], "pests": string[], "approvedUsage"?, "applicationMethod"? },
  "dosage": { "dosageInstructions"?, "dosageUnits"?, "tankCapacity"?, "tankCapacityMentioned": boolean, "explanation"?, "unclearOrMissing": boolean },
  "waitingPeriod": { "preHarvestInterval"?, "waitingPeriod"?, "reEntryInterval"?, "explanation"? },
  "safetyInstructions": { "protectiveEquipment": string[], "handlingPrecautions": string[], "storageInstructions": string[], "environmentalPrecautions": string[], "disposalInstructions": string[], "firstAid": string[] },
  "warnings": [ { "type": "toxicity"|"skin-eye"|"environmental"|"restricted"|"missing-info", "title": string, "details": string, "severity": "high"|"medium"|"low" } ],
  "overallConfidence": "high"|"medium"|"low"|"missing",
  "missingFields": string[]
}

Provide the "explanation" fields in language code "${language}". Keep all extracted values in their original wording.

OCR TEXT:
"""
${rawText}
""`;
}

export const AI_ANALYSIS_PROMPT = '';
