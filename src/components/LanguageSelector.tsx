import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { LANGUAGES } from '@/lib/languages';
import type { LanguageCode } from '@/types';
import { useApp } from '@/context/AppContext';

export function LanguageSelector() {
  const { language, setLanguage } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">{current.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 glass-card-strong p-2 z-50 animate-scale-in">
          <p className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase">Select Language</p>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code as LanguageCode);
                setOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-2.5 py-2 rounded-lg text-left transition-colors ${
                l.code === language
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span className="flex-1">
                <span className="block text-sm font-medium">{l.nativeName}</span>
                <span className="block text-xs text-slate-400">{l.name}</span>
              </span>
              {l.code === language && <Check className="w-4 h-4 text-brand-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
