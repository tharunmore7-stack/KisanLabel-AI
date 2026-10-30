import {
  ScanLine,
  Sparkles,
  ArrowRight,
  Camera,
  FileText,
  Languages,
  ShieldCheck,
  Leaf,
  Brain,
  Cpu,
  Wifi,
  WifiOff,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Hand,
  Droplets,
  Trash2,
  Activity,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AiModeBadge } from '@/components/StatusBadges';

const HERO_IMG =
  'https://images.pexels.com/photos/20445181/pexels-photo-20445181.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const FEATURES = [
  {
    icon: Camera,
    title: 'Scan Any Label',
    desc: 'Upload photos or PDFs, or capture directly with your phone camera.',
  },
  {
    icon: Brain,
    title: 'Gemini AI Analysis',
    desc: 'Google Gemini reads the label and extracts structured product details.',
  },
  {
    icon: Cpu,
    title: 'Offline Backup',
    desc: 'When the internet is down, Ollama + Tesseract OCR keep you going.',
  },
  {
    icon: Languages,
    title: '9 Indian Languages',
    desc: 'Get explanations in Telugu, Hindi, Tamil, Kannada, and more.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety First',
    desc: 'Clear warning cards for toxicity, handling, and environmental hazards.',
  },
  {
    icon: FileText,
    title: 'Dosage Clarity',
    desc: 'Exact label dosage only — never invented or recalculated.',
  },
];

const STEPS = [
  {
    n: 1,
    icon: Camera,
    title: 'Capture the Label',
    desc: 'Take a clear photo or upload images and PDFs of the pesticide label.',
  },
  {
    n: 2,
    icon: Sparkles,
    title: 'AI Reads Everything',
    desc: 'Gemini extracts product, crop, dosage, waiting period, and safety data.',
  },
  {
    n: 3,
    icon: FileText,
    title: 'Get Your Report',
    desc: 'A clean dashboard shows verified information and clear warnings.',
  },
  {
    n: 4,
    icon: MessageSquare,
    title: 'Ask Follow-ups',
    desc: 'Chat with the AI assistant about anything on the scanned label.',
  },
];

const SAFETY = [
  { icon: Eye, title: 'Eye & Skin Protection', desc: 'Identifies required PPE from the label.' },
  { icon: Hand, title: 'Handling Precautions', desc: 'Surfaces safe-mixing and application steps.' },
  { icon: Droplets, title: 'Environmental Care', desc: 'Flags hazards to bees, fish, and water.' },
  { icon: Trash2, title: 'Safe Disposal', desc: 'Shows proper container and residue disposal.' },
  { icon: Activity, title: 'First Aid', desc: 'Extracts emergency response instructions.' },
  { icon: Clock, title: 'Waiting Period', desc: 'Clarifies pre-harvest and re-entry intervals.' },
];

export function LandingPage() {
  const { navigate } = useApp();

  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-green bg-[size:24px_24px] opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 lg:pt-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-7 animate-slide-up">
              <div className="flex items-center gap-2">
                <AiModeBadge />
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-med-50 text-med-700 text-xs font-medium">
                  <Leaf className="w-3.5 h-3.5" /> For Indian Farmers
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Understand Every{' '}
                <span className="bg-gradient-to-r from-brand-600 to-med-600 bg-clip-text text-transparent">
                  Pesticide Label
                </span>{' '}
                with AI.
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                Scan pesticide labels, understand approved crop usage, identify important safety
                instructions and get easy explanations in your preferred language.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => navigate('scan')} className="btn-primary text-base">
                  <ScanLine className="w-5 h-5" /> Scan Pesticide Label
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-secondary text-base"
                >
                  Explore Features <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-5 pt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-500" /> No fake info</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-500" /> 9 languages</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Works offline</span>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative animate-scale-in">
              <div className="relative rounded-3xl overflow-hidden shadow-glass-lg border border-brand-100">
                <img
                  src={HERO_IMG}
                  alt="Indian farmer in a green field"
                  className="w-full h-[360px] sm:h-[440px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 via-transparent to-transparent" />
                {/* Scanning preview card */}
                <div className="absolute bottom-4 left-4 right-4 glass-card-strong p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
                      <ScanLine className="w-6 h-6 text-brand-600" />
                      <span className="absolute inset-0 rounded-xl border-2 border-brand-400/50 animate-pulse-ring" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">Analyzing label…</p>
                      <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-brand-500 to-med-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* floating badges */}
              <div className="absolute -top-3 -right-2 glass-card px-3 py-2 flex items-center gap-2 animate-fade-in">
                <Wifi className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-medium text-slate-700">Gemini online</span>
              </div>
              <div className="absolute -bottom-3 -left-2 glass-card px-3 py-2 flex items-center gap-2 animate-fade-in">
                <WifiOff className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-700">Ollama backup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="section-label"><Sparkles className="w-3.5 h-3.5" /> Features</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">Everything a farmer needs to read a label</h2>
          <p className="mt-3 text-slate-600">
            From capturing the label to understanding every safety warning — KisanLabel AI covers the full journey.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="glass-card p-6 hover:shadow-glass-lg transition-all hover:-translate-y-0.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-50 to-med-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-slate-800">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gradient-to-b from-brand-50/50 to-white border-y border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="section-label"><Activity className="w-3.5 h-3.5" /> How It Works</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">Four steps to a safer decision</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.n} className="relative glass-card p-6 text-center">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                    {s.n}
                  </div>
                  <div className="mt-3 w-12 h-12 mx-auto rounded-xl bg-brand-50 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SAFETY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="section-label"><ShieldCheck className="w-3.5 h-3.5" /> Farmer Safety</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">Safety is built into every scan</h2>
          <p className="mt-3 text-slate-600">
            KisanLabel AI surfaces the safety information that matters most, exactly as written on the official label.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SAFETY.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="flex items-start gap-4 p-5 rounded-2xl border border-amber-100 bg-amber-50/40">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-start gap-4 p-6 rounded-2xl border border-med-200 bg-med-50/50">
          <AlertTriangle className="w-6 h-6 text-med-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-slate-800">Accuracy &amp; safety commitment</h3>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              KisanLabel AI never hallucinates pesticide information. Dosage, tank capacity, mixing
              instructions and crop recommendations come only from verified label text. AI-generated
              explanations are clearly separated from extracted data, and missing or uncertain
              information is always flagged. Always follow the official product label and consult a
              qualified agricultural expert for application decisions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-10 sm:p-14 text-center">
          <div className="absolute inset-0 bg-grid-green bg-[size:20px_20px] opacity-20" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to scan your first label?</h2>
            <p className="mt-3 text-brand-50 max-w-xl mx-auto">
              It takes seconds. Point your camera, and let AI explain everything in your language.
            </p>
            <button
              onClick={() => navigate('scan')}
              className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-brand-700 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <ScanLine className="w-5 h-5" /> Start Scanning
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
