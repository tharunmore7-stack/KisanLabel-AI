import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AiMode, LanguageCode, LabelAnalysis, ScanRecord } from '@/types';
import { getLanguage } from '@/lib/languages';
import { checkOllamaAvailable } from '@/lib/aiAnalysis';
import { isSupabaseConfigured } from '@/lib/supabase';

interface AppState {
  aiMode: AiMode;
  setAiMode: (m: AiMode) => void;
  language: LanguageCode;
  setLanguage: (l: LanguageCode) => void;
  online: boolean;
  ollamaAvailable: boolean;
  supabaseReady: boolean;
  checkingOllama: boolean;
  lastAnalysis: LabelAnalysis | null;
  setLastAnalysis: (a: LabelAnalysis | null) => void;
  lastScan: ScanRecord | null;
  setLastScan: (s: ScanRecord | null) => void;
  route: Route;
  navigate: (r: Route) => void;
}

export type Route =
  | 'home'
  | 'scan'
  | 'history'
  | 'assistant'
  | 'about'
  | 'dashboard';

const AppContext = createContext<AppState | null>(null);

const MODE_KEY = 'kisanlabel_ai_mode';
const LANG_KEY = 'kisanlabel_language';

export function AppProvider({ children }: { children: ReactNode }) {
  const [aiMode, setAiModeState] = useState<AiMode>(() => {
    const saved = localStorage.getItem(MODE_KEY);
    return saved === 'offline' ? 'offline' : 'online';
  });
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem(LANG_KEY) as LanguageCode | null;
    return saved ?? 'en';
  });
  const [online, setOnline] = useState(navigator.onLine);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [checkingOllama, setCheckingOllama] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<LabelAnalysis | null>(null);
  const [lastScan, setLastScan] = useState<ScanRecord | null>(null);
  const [route, setRoute] = useState<Route>('home');

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const refreshOllama = async () => {
    setCheckingOllama(true);
    const ok = await checkOllamaAvailable();
    setOllamaAvailable(ok);
    setCheckingOllama(false);
  };

  useEffect(() => {
    refreshOllama();
    const id = setInterval(refreshOllama, 30000);
    return () => clearInterval(id);
  }, []);

  const setAiMode = (m: AiMode) => {
    setAiModeState(m);
    localStorage.setItem(MODE_KEY, m);
  };

  const setLanguage = (l: LanguageCode) => {
    setLanguageState(l);
    localStorage.setItem(LANG_KEY, l);
    getLanguage(l);
  };

  const navigate = (r: Route) => {
    setRoute(r);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const value = useMemo<AppState>(
    () => ({
      aiMode,
      setAiMode,
      language,
      setLanguage,
      online,
      ollamaAvailable,
      supabaseReady: isSupabaseConfigured,
      checkingOllama,
      lastAnalysis,
      setLastAnalysis,
      lastScan,
      setLastScan,
      route,
      navigate,
    }),
    [aiMode, language, online, ollamaAvailable, checkingOllama, lastAnalysis, lastScan, route]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
