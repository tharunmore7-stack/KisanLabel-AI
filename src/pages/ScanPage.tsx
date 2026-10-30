import { useCallback, useRef, useState } from 'react';
import {
  ScanLine,
  Upload,
  Camera,
  X,
  RotateCw,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  Loader2,
  Sparkles,
  FileSearch,
  Cloud,
  HardDrive,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { LabelImage } from '@/types';
import { analyzeLabel } from '@/lib/aiAnalysis';
import { saveScan } from '@/lib/scanHistory';
import { AnalysisDashboard } from '@/components/AnalysisDashboard';
import { OnlineBadge, AiModeBadge } from '@/components/StatusBadges';

type Phase = 'upload' | 'scanning' | 'result' | 'error';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function fileToImage(file: File): Promise<LabelImage> {
  const dataUrl = await readFileAsDataUrl(file);
  return { id: uid(), dataUrl, name: file.name, mimeType: file.type || guessMime(file.name) };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function guessMime(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  return 'image/jpeg';
}

export function ScanPage() {
  const { aiMode, language, setLastAnalysis, setLastScan, ollamaAvailable, supabaseReady, online } = useApp();
  const [phase, setPhase] = useState<Phase>('upload');
  const [images, setImages] = useState<LabelImage[]>([]);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<{ stage: string; pct: number }>({ stage: '', pct: 0 });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const onFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) =>
      ACCEPTED.includes(f.type) || /\.(jpe?g|png|pdf)$/i.test(f.name)
    );
    if (arr.length === 0) {
      setError('Please upload JPG, PNG images or a PDF file.');
      return;
    }
    setError('');
    const newImgs = await Promise.all(arr.map(fileToImage));
    setImages((prev) => [...prev, ...newImgs]);
  }, []);

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  const rotateImage = async (id: string) => {
    const target = images.find((i) => i.id === id);
    if (!target || target.mimeType === 'application/pdf') return;
    const rotated = await rotateDataUrl(target.dataUrl);
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, dataUrl: rotated } : img)));
  };

  const handleScan = async () => {
    if (images.length === 0) {
      setError('Please add at least one label image first.');
      return;
    }

    if (aiMode === 'online' && !supabaseReady) {
      setError(
        'The Gemini online service is not configured on this backend. ' +
          (ollamaAvailable
            ? 'You can switch to Offline AI mode to analyze locally with Ollama.'
            : 'Start Ollama locally to use Offline AI mode.')
      );
      setPhase('error');
      return;
    }

    if (aiMode === 'offline' && !ollamaAvailable) {
      setError(
        'Offline AI needs Ollama running at http://localhost:11434 with the gemma:2b model. ' +
          'Switch to Online AI mode to use Gemini instead.'
      );
      setPhase('error');
      return;
    }

    setPhase('scanning');
    setProgress({ stage: 'Starting…', pct: 0 });
    setError('');

    const { analysis, rawText, error: aiError } = await analyzeLabel({
      images,
      mode: aiMode,
      language,
      onProgress: (stage, pct) => setProgress({ stage, pct }),
    });

    if (aiError) {
      setError(aiError);
      setPhase('error');
      return;
    }

    const enriched = { ...analysis, rawExtractedText: rawText };
    setLastAnalysis(enriched);

    try {
      const record = await saveScan({
        analysis: enriched,
        aiMode,
        language,
        imageCount: images.length,
      });
      setLastScan(record);
    } catch {
      /* non-blocking */
    }

    setPhase('result');
  };

  const reset = () => {
    setPhase('upload');
    setImages([]);
    setError('');
    setProgress({ stage: '', pct: 0 });
  };

  if (phase === 'result') {
    return <AnalysisDashboard onRescan={reset} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="text-center mb-8">
        <span className="section-label"><ScanLine className="w-3.5 h-3.5" /> AI Scanner</span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">Scan a Pesticide Label</h1>
        <p className="mt-2 text-slate-600">
          Upload photos or PDFs, or use your camera. We never invent product information.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          <OnlineBadge />
          <AiModeBadge />
        </div>
      </div>

      {/* UPLOAD PHASE */}
      {phase === 'upload' && (
        <div className="space-y-5 animate-scale-in">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onFiles(e.dataTransfer.files);
            }}
            className={`rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-colors ${
              dragOver ? 'border-brand-400 bg-brand-50' : 'border-brand-200 bg-white/60'
            }`}
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-50 to-med-50 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-brand-600" />
            </div>
            <h3 className="font-semibold text-slate-800">Drag &amp; drop label images here</h3>
            <p className="mt-1 text-sm text-slate-500">Supports JPG, JPEG, PNG and PDF</p>
            <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
              >
                <Upload className="w-4 h-4" /> Upload Files
              </button>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="btn-secondary"
              >
                <Camera className="w-4 h-4" /> Use Camera
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && onFiles(e.target.files)}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && onFiles(e.target.files)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 text-amber-800 text-sm border border-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Image previews */}
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">
                  {images.length} file{images.length > 1 ? 's' : ''} ready
                </h3>
                <button onClick={() => setImages([])} className="btn-ghost text-sm">
                  <X className="w-4 h-4" /> Clear all
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative group rounded-xl overflow-hidden border border-brand-100 bg-slate-50 aspect-[3/4]"
                  >
                    {img.mimeType === 'application/pdf' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-3">
                        <FileText className="w-10 h-10 text-med-500" />
                        <span className="mt-2 text-xs truncate w-full text-center">{img.name}</span>
                      </div>
                    ) : (
                      <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-1.5 right-1.5 flex gap-1">
                      <button
                        onClick={() => rotateImage(img.id)}
                        className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-slate-600 hover:text-brand-600 shadow-sm"
                        title="Rotate"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeImage(img.id)}
                        className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-rose-500 hover:text-rose-600 shadow-sm"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[3/4] rounded-xl border-2 border-dashed border-brand-200 flex flex-col items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <ImageIcon className="w-6 h-6" />
                  <span className="mt-1 text-xs font-medium">Add more</span>
                </button>
              </div>
            </div>
          )}

          {/* Scan button */}
          {images.length > 0 && (
            <div className="sticky bottom-4 z-10">
              <button
                onClick={handleScan}
                className="w-full btn-primary text-lg py-4 shadow-glass-lg bg-gradient-to-r from-brand-600 to-brand-700"
              >
                <Sparkles className="w-5 h-5" /> Analyze Label with{' '}
                {aiMode === 'online' ? 'Gemini AI' : 'Offline AI'}
              </button>
            </div>
          )}

          {/* Not configured notice */}
          {aiMode === 'online' && !supabaseReady && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-med-50 text-med-800 text-sm border border-med-200">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Gemini service not configured</p>
                <p className="mt-1 text-med-700">
                  The backend Gemini API key is not set, so online scanning is unavailable. Add a
                  <code className="mx-1 px-1 py-0.5 rounded bg-white">GEMINI_API_KEY</code>
                  secret to the project, or switch to Offline AI mode using Ollama.
                </p>
              </div>
            </div>
          )}
          {aiMode === 'offline' && !ollamaAvailable && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 text-slate-700 text-sm border border-slate-200">
              <HardDrive className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Ollama not detected</p>
                <p className="mt-1 text-slate-600">
                  Offline AI needs Ollama running at <code className="px-1 py-0.5 rounded bg-white">localhost:11434</code>
                  {' '}with the <code className="px-1 py-0.5 rounded bg-white">gemma:2b</code> model installed. Start Ollama or switch to Online AI.
                </p>
              </div>
            </div>
          )}
          {!online && aiMode === 'online' && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 text-amber-800 text-sm border border-amber-200">
              <Cloud className="w-5 h-5 shrink-0 mt-0.5" />
              <p>You are offline. Online (Gemini) scanning needs internet. Switch to Offline AI to continue with Ollama.</p>
            </div>
          )}
        </div>
      )}

      {/* SCANNING PHASE */}
      {phase === 'scanning' && <ScanningAnimation progress={progress} mode={aiMode} images={images} />}

      {/* ERROR PHASE */}
      {phase === 'error' && (
        <div className="text-center py-10 animate-scale-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800">Scan could not complete</h3>
          <p className="mt-2 text-slate-600 max-w-md mx-auto">{error}</p>
          <button onClick={reset} className="mt-6 btn-primary">
            <FileSearch className="w-4 h-4" /> Try Again
          </button>
        </div>
      )}
    </div>
  );
}

function ScanningAnimation({
  progress,
  mode,
  images,
}: {
  progress: { stage: string; pct: number };
  mode: 'online' | 'offline';
  images: LabelImage[];
}) {
  const preview = images[0];
  return (
    <div className="flex flex-col items-center py-10 animate-fade-in">
      <div className="relative w-56 h-72 rounded-2xl overflow-hidden border-2 border-brand-200 bg-slate-50 shadow-glass-lg">
        {preview && preview.mimeType !== 'application/pdf' ? (
          <img src={preview.dataUrl} alt="scanning" className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-16 h-16 text-slate-300" />
          </div>
        )}
        {/* scan line */}
        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_12px_2px_rgba(16,185,129,0.6)] animate-scan-line" />
        {/* overlay */}
        <div className="absolute inset-0 bg-brand-900/10" />
        {/* corner brackets */}
        <span className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-brand-400 rounded-tl-lg" />
        <span className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-brand-400 rounded-tr-lg" />
        <span className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-brand-400 rounded-bl-lg" />
        <span className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-brand-400 rounded-br-lg" />
      </div>

      <div className="mt-6 flex items-center gap-2 text-brand-700">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="font-medium">{progress.stage || 'Analyzing…'}</span>
      </div>

      <div className="mt-3 w-full max-w-sm">
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-med-500 transition-all duration-300"
            style={{ width: `${Math.round(progress.pct * 100)}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-400 text-center">
          {mode === 'online' ? 'Gemini AI · cloud' : 'Ollama · local model'} · {Math.round(progress.pct * 100)}%
        </p>
      </div>
    </div>
  );
}

function rotateDataUrl(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
