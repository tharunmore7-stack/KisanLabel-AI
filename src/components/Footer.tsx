import { Leaf, ShieldCheck, ScanLine, Mail, Github, Heart } from 'lucide-react';
import { Logo } from './Logo';
import { useApp, type Route } from '@/context/AppContext';

export function Footer() {
  const { navigate } = useApp();
  const links: { label: string; route: Route }[] = [
    { label: 'Home', route: 'home' },
    { label: 'Scan Label', route: 'scan' },
    { label: 'Scan History', route: 'history' },
    { label: 'AI Assistant', route: 'assistant' },
    { label: 'About', route: 'about' },
  ];

  return (
    <footer className="mt-20 border-t border-brand-100 bg-gradient-to-b from-white to-brand-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2 space-y-4">
            <Logo size={40} />
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              KisanLabel AI helps Indian farmers understand pesticide labels with artificial intelligence.
              Smart Farming. Safer Decisions.
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="mailto:hello@kisanlabel.ai" className="hover:text-brand-600 transition-colors" aria-label="Email">
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Navigate</h4>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.route}>
                  <button
                    onClick={() => navigate(l.route)}
                    className="text-sm text-slate-500 hover:text-brand-600 transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">What it does</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2"><ScanLine className="w-4 h-4 text-brand-500" /> Scans pesticide labels</li>
              <li className="flex items-center gap-2"><Leaf className="w-4 h-4 text-brand-500" /> Explains in your language</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-500" /> Highlights safety warnings</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-brand-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} KisanLabel AI. For informational purposes only — always follow official label instructions and consult qualified agricultural experts.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            Made with <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500" /> for Indian farmers
          </p>
        </div>
      </div>
    </footer>
  );
}
