import {
  Info,
  ScanLine,
  Brain,
  Cpu,
  Languages,
  ShieldCheck,
  Sparkles,
  Cloud,
  HardDrive,
  Lock,
  Leaf,
  Heart,
  AlertTriangle,
  FileText,
  Camera,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AiModeBadge } from '@/components/StatusBadges';
import { LANGUAGES } from '@/lib/languages';

const FEATURES = [
  {
    icon: ScanLine,
    title: 'AI Pesticide Label Scanner',
    desc: 'Upload JPG, PNG, or PDF pesticide labels, or capture them directly with your phone camera. Rotate, remove, and scan multiple images at once.',
  },
  {
    icon: Brain,
    title: 'Google Gemini Analysis',
    desc: 'Gemini reads the label photograph, extracts structured product details, and explains everything in your preferred language. No fake information is ever generated.',
  },
  {
    icon: Cpu,
    title: 'Offline AI with Ollama',
    desc: 'When the internet is down, KisanLabel AI falls back to a local Ollama model (Gemma) with on-device Tesseract OCR — no data leaves your device.',
  },
  {
    icon: Languages,
    title: '9 Indian Languages',
    desc: 'Get explanations in English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Bengali, and Punjabi. Chemical names, numbers, and units stay exact.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety-First Warnings',
    desc: 'Clear warning cards surface toxicity, skin and eye, environmental, and restricted-use hazards directly from the official label.',
  },
  {
    icon: Lock,
    title: 'Privacy by Design',
    desc: 'API keys stay on the backend. Offline scans never touch the cloud. Cloud sync of local scans is optional and needs your consent.',
  },
];

const ACCURACY = [
  'Information directly extracted from the label.',
  'AI-generated explanations (clearly marked).',
  'Missing or uncertain information (always flagged).',
];

export function AboutPage() {
  const { navigate } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-12">
        <span className="section-label"><Info className="w-3.5 h-3.5" /> About</span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">
          Making pesticide labels <span className="bg-gradient-to-r from-brand-600 to-med-600 bg-clip-text text-transparent">understandable</span> for every Indian farmer
        </h1>
        <p className="mt-4 text-slate-600 max-w-2xl mx-auto leading-relaxed">
          KisanLabel AI uses artificial intelligence to read pesticide product labels and explain them
          in simple language — so farmers can make safer, more informed decisions.
        </p>
        <p className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 font-medium text-sm">
          <Leaf className="w-4 h-4" /> Smart Farming. Safer Decisions.
        </p>
      </div>

      {/* How it works at a glance */}
      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {[
          { icon: Camera, title: '1. Scan', desc: 'Capture or upload the pesticide label.' },
          { icon: Brain, title: '2. Analyze', desc: 'Gemini (or Ollama) extracts the details.' },
          { icon: FileText, title: '3. Understand', desc: 'Get a clean, multilingual report.' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="glass-card p-5 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-brand-50 to-med-50 flex items-center justify-center mb-3">
                <Icon className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-semibold text-slate-800">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Two modes */}
      <div className="grid sm:grid-cols-2 gap-5 mb-12">
        <div className="glass-card p-6 border-l-4 border-l-med-400">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-med-50 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-med-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Online AI — Google Gemini</h3>
              <p className="text-xs text-slate-500">Default mode</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Uses Google Gemini's image understanding to read pesticide labels directly from photographs.
            Provides the richest analysis. Requires internet and a configured API key on the backend.
          </p>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-slate-400">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Offline AI — Ollama</h3>
              <p className="text-xs text-slate-500">Backup mode</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Uses a local Gemma model through Ollama with on-device Tesseract OCR. Works with no internet.
            Nothing is sent to the cloud. Requires Ollama running at localhost:11434.
          </p>
        </div>
      </div>

      {/* Features grid */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-brand-600" />
          <h2 className="text-2xl font-bold text-slate-900">What KisanLabel AI does</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="glass-card p-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-50 to-med-50 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-slate-800">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Languages */}
      <div className="glass-card p-6 mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Languages className="w-5 h-5 text-brand-600" />
          <h2 className="text-xl font-bold text-slate-900">Supported languages</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {LANGUAGES.map((l) => (
            <div key={l.code} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50">
              <span className="text-xl">{l.flag}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{l.nativeName}</p>
                <p className="text-xs text-slate-400 truncate">{l.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accuracy commitment */}
      <div className="rounded-2xl border border-med-200 bg-med-50/50 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-med-600" />
          <h2 className="text-xl font-bold text-slate-900">Accuracy &amp; safety commitment</h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          KisanLabel AI never hallucinates pesticide information. Every report clearly distinguishes three kinds of content:
        </p>
        <div className="space-y-2">
          {ACCURACY.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
              <span className="w-6 h-6 rounded-full bg-med-100 text-med-700 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              {a}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Always follow the official product label and consult a qualified agricultural expert for application decisions.
            KisanLabel AI is an informational aid, not a substitute for professional advice.
          </span>
        </div>
      </div>

      {/* Status + CTA */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <AiModeBadge />
        </div>
        <button onClick={() => navigate('scan')} className="btn-primary text-base">
          <ScanLine className="w-5 h-5" /> Start Scanning
        </button>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          Made with <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500" /> for Indian farmers
        </p>
      </div>
    </div>
  );
}
