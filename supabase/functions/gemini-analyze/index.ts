const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// Configurable Gemini model name — override with the GEMINI_MODEL secret.
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.0-flash';

interface IncomingImage {
  dataUrl: string;
  mimeType: string;
}

interface RequestBody {
  images?: IncomingImage[];
  language?: string;
  chat?: boolean;
  question?: string;
  labelContext?: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  te: 'Telugu',
  hi: 'Hindi',
  ta: 'Tamil',
  kn: 'Kannada',
  ml: 'Malayalam',
  mr: 'Marathi',
  bn: 'Bengali',
  pa: 'Punjabi',
};

function dataUrlToParts(dataUrl: string, mimeType: string): { inlineData: { data: string; mimeType: string } } {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  return { inlineData: { data: base64, mimeType } };
}

function buildAnalysisPrompt(language: string): string {
  const langName = LANGUAGE_NAMES[language] ?? 'English';
  return `You are KisanLabel AI, an assistant that reads Indian pesticide product labels from photographs.
Analyze the provided pesticide label image(s). Extract ONLY information visible on the label.
NEVER invent dosage, tank capacity, mixing ratios, or crop recommendations.
If a field is not visible on the label, leave it empty and add its name to missingFields.
Preserve chemical names, product names, numbers and measurement units exactly as written.
Provide any "explanation" fields in ${langName}, but keep all extracted values in their original wording.

Return ONLY a valid JSON object matching this TypeScript type (no markdown, no prose):

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

tankCapacityMentioned must be true ONLY if the label explicitly states a tank capacity.
unclearOrMissing must be true if dosage instructions are unclear or absent.`;
}

function buildChatPrompt(question: string, labelContext: string, language: string): string {
  const langName = LANGUAGE_NAMES[language] ?? 'English';
  return `You are KisanLabel AI. Answer the farmer's question based ONLY on the scanned label context below.
Do not invent pesticide recommendations or dosage. If the answer is not in the context, say so honestly.
Respond in ${langName}.

LABEL CONTEXT (JSON):
${labelContext}

QUESTION: ${question}

Return ONLY a JSON object: { "answer": string }`;
}

function extractJson(text: string): unknown | null {
  // Strip markdown fences if present, then find first {...} block.
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function callGemini(contents: unknown[], systemPrompt: string): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the backend.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const body = {
    contents,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned an empty response.');
  return text;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RequestBody;

    // ---------- Chat mode ----------
    if (body.chat && body.question) {
      const systemPrompt = buildChatPrompt(
        body.question,
        body.labelContext ?? '{}',
        body.language ?? 'en'
      );
      const contents = [{ role: 'user', parts: [{ text: body.question }] }];
      const text = await callGemini(contents, systemPrompt);
      const parsed = extractJson(text) as { answer?: string } | null;
      const answer = parsed?.answer ?? text;
      return new Response(JSON.stringify({ answer }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---------- Analysis mode ----------
    const images = body.images ?? [];
    if (images.length === 0) {
      return new Response(JSON.stringify({ error: 'No images provided.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const language = body.language ?? 'en';
    const systemPrompt = buildAnalysisPrompt(language);

    const parts: unknown[] = [];
    parts.push({ text: 'Analyze the following pesticide label image(s) and return the structured JSON.' });
    for (const img of images) {
      try {
        parts.push(dataUrlToParts(img.dataUrl, img.mimeType || 'image/jpeg'));
      } catch {
        /* skip invalid image */
      }
    }

    const text = await callGemini([{ role: 'user', parts }], systemPrompt);
    const analysis = extractJson(text);
    if (!analysis) {
      return new Response(
        JSON.stringify({ error: 'Could not parse AI response. Please try a clearer photo.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const extractedText = '';

    return new Response(JSON.stringify({ analysis, extractedText: extractedText || undefined }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown edge function error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
