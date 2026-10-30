import { Wifi, WifiOff, Cloud, HardDrive, Loader2, CircleCheck, CircleAlert } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function OnlineBadge() {
  const { online } = useApp();
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        online ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
      {online ? 'Online' : 'Offline'}
    </span>
  );
}

export function AiModeBadge() {
  const { aiMode, ollamaAvailable, supabaseReady, checkingOllama } = useApp();
  const online = aiMode === 'online';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        online ? 'bg-med-50 text-med-700' : 'bg-slate-100 text-slate-600'
      }`}
      title={
        online
          ? supabaseReady
            ? 'Using Google Gemini'
            : 'Gemini service not configured'
          : ollamaAvailable
            ? 'Using local Ollama model'
            : 'Ollama not detected'
      }
    >
      {online ? <Cloud className="w-3.5 h-3.5" /> : <HardDrive className="w-3.5 h-3.5" />}
      {online ? 'Gemini AI' : 'Offline AI'}
      {online && !supabaseReady && <CircleAlert className="w-3 h-3 text-amber-500" />}
      {!online && checkingOllama && <Loader2 className="w-3 h-3 animate-spin" />}
      {!online && !ollamaAvailable && !checkingOllama && <CircleAlert className="w-3 h-3 text-amber-500" />}
    </span>
  );
}

export function ServiceStatusDot({
  ok,
  label,
}: {
  ok: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {ok ? (
        <CircleCheck className="w-4 h-4 text-brand-500" />
      ) : (
        <CircleAlert className="w-4 h-4 text-amber-500" />
      )}
      <span className="text-sm text-slate-600">{label}</span>
    </div>
  );
}
