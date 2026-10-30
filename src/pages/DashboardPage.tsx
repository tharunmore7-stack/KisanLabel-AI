import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  ScanLine,
  Cloud,
  HardDrive,
  Activity,
  Loader2,
  Sparkles,
  ArrowRight,
  History,
  CircleCheck,
  CircleAlert,
  Bot,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { ScanRecord } from '@/types';
import { getAllScans } from '@/lib/scanHistory';
import { AiModeBadge, OnlineBadge, ServiceStatusDot } from '@/components/StatusBadges';
import { getLanguage } from '@/lib/languages';

export function DashboardPage() {
  const { navigate, aiMode, online, ollamaAvailable, supabaseReady, checkingOllama, language } = useApp();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllScans().then(({ records }) => {
      setScans(records);
      setLoading(false);
    });
  }, []);

  const recent = scans.slice(0, 4);
  const lang = getLanguage(language);

  const stats = [
    { label: 'Total labels scanned', value: scans.length, icon: ScanLine, color: 'from-brand-500 to-brand-700' },
    { label: 'Recent scans', value: recent.length, icon: History, color: 'from-med-500 to-med-700' },
    { label: 'Current AI mode', value: aiMode === 'online' ? 'Gemini' : 'Ollama', icon: aiMode === 'online' ? Cloud : HardDrive, color: 'from-slate-500 to-slate-700' },
    { label: 'Active language', value: lang.nativeName, icon: Sparkles, color: 'from-amber-500 to-amber-700' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="section-label"><LayoutDashboard className="w-3.5 h-3.5" /> Dashboard</span>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Welcome back, Farmer</h1>
          <p className="mt-1 text-slate-500">Here's an overview of your KisanLabel AI activity.</p>
        </div>
        <button onClick={() => navigate('scan')} className="btn-primary">
          <ScanLine className="w-4 h-4" /> Quick Scan
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Service status */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-slate-800 mb-4">AI Service Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Internet connection</span>
              <OnlineBadge />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Active AI engine</span>
              <AiModeBadge />
            </div>
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <ServiceStatusDot ok={online} label={online ? 'Internet is connected' : 'Currently offline'} />
              <ServiceStatusDot
                ok={supabaseReady}
                label={supabaseReady ? 'Gemini (online) configured' : 'Gemini not configured'}
              />
              <div className="flex items-center gap-2">
                {checkingOllama ? (
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                ) : ollamaAvailable ? (
                  <CircleCheck className="w-4 h-4 text-brand-500" />
                ) : (
                  <CircleAlert className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-sm text-slate-600">
                  {ollamaAvailable ? 'Ollama (offline) available' : 'Ollama not detected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent scans */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Recent scans</h3>
            <button
              onClick={() => navigate('history')}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-14" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">No scans yet.</p>
              <button onClick={() => navigate('scan')} className="mt-3 btn-secondary text-sm">
                <ScanLine className="w-4 h-4" /> Start scanning
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <button
                  key={r.id}
                  onClick={() => navigate('history')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-brand-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    {r.ai_mode === 'online' ? (
                      <Cloud className="w-5 h-5 text-med-600" />
                    ) : (
                      <HardDrive className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">
                      {r.product_name ?? 'Unidentified label'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(r.created_at).toLocaleDateString()} · {r.ai_mode === 'online' ? 'Gemini' : 'Ollama'}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <ActionCard
          icon={ScanLine}
          title="Scan a Label"
          desc="Upload or capture a pesticide label"
          onClick={() => navigate('scan')}
        />
        <ActionCard
          icon={Bot}
          title="Ask the AI"
          desc="Chat about your scanned label"
          onClick={() => navigate('assistant')}
        />
        <ActionCard
          icon={History}
          title="Scan History"
          desc="Revisit past reports"
          onClick={() => navigate('history')}
        />
      </div>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  icon: typeof ScanLine;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="glass-card p-5 text-left hover:shadow-glass-lg hover:-translate-y-0.5 transition-all group"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 text-brand-600" />
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
      </div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500">{desc}</p>
    </button>
  );
}


