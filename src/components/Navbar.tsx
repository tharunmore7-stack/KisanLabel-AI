import { useState, useEffect } from 'react';
import { Menu, X, ScanLine, History, MessageSquare, Info, Home, LayoutDashboard, Cloud, HardDrive } from 'lucide-react';
import { Logo } from './Logo';
import { LanguageSelector } from './LanguageSelector';
import { OnlineBadge, AiModeBadge } from './StatusBadges';
import { useApp, type Route } from '@/context/AppContext';

const NAV_ITEMS: { route: Route; label: string; icon: typeof Home }[] = [
  { route: 'home', label: 'Home', icon: Home },
  { route: 'scan', label: 'Scan Label', icon: ScanLine },
  { route: 'history', label: 'Scan History', icon: History },
  { route: 'assistant', label: 'AI Assistant', icon: MessageSquare },
  { route: 'about', label: 'About', icon: Info },
];

export function Navbar() {
  const { route, navigate, aiMode, setAiMode, ollamaAvailable } = useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (r: Route) => {
    navigate(r);
    setOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-brand-100 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Logo onClick={() => go('home')} />
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = route === item.route || (route === 'dashboard' && item.route === 'home');
                const Icon = item.icon;
                return (
                  <button
                    key={item.route}
                    onClick={() => go(item.route)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2">
              <OnlineBadge />
              <AiModeBadge />
            </div>
            {/* AI mode switch */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-slate-100">
              <button
                onClick={() => setAiMode('online')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  aiMode === 'online' ? 'bg-white text-med-700 shadow-sm' : 'text-slate-500'
                }`}
                title="Use Google Gemini online"
              >
                <Cloud className="w-3.5 h-3.5" /> Online
              </button>
              <button
                onClick={() => setAiMode('offline')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  aiMode === 'offline' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500'
                }`}
                title="Use local Ollama model"
                disabled={!ollamaAvailable && aiMode !== 'offline'}
              >
                <HardDrive className="w-3.5 h-3.5" /> Offline
              </button>
            </div>
            <LanguageSelector />
            <button
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-brand-50"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-brand-100 bg-white/95 backdrop-blur-xl animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            <button
              onClick={() => go('dashboard')}
              className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium ${
                route === 'dashboard' ? 'bg-brand-50 text-brand-700' : 'text-slate-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = route === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => go(item.route)}
                  className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium ${
                    active ? 'bg-brand-50 text-brand-700' : 'text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </button>
              );
            })}
            <div className="flex items-center gap-2 pt-2">
              <OnlineBadge />
              <AiModeBadge />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
