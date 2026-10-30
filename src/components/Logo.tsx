import { Leaf, ScanLine } from 'lucide-react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  onClick?: () => void;
}

export function Logo({ size = 36, showText = true, onClick }: LogoProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 group focus:outline-none"
      aria-label="KisanLabel AI home"
    >
      <span
        className="relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md transition-transform group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <Leaf className="text-white" style={{ width: size * 0.5, height: size * 0.5 }} />
        <ScanLine
          className="absolute text-white/90"
          style={{ width: size * 0.32, height: size * 0.32 }}
        />
      </span>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="font-semibold text-slate-800 tracking-tight" style={{ fontSize: size * 0.42 }}>
            KisanLabel
          </span>
          <span className="text-brand-600 font-medium tracking-wide" style={{ fontSize: size * 0.28 }}>
            AI
          </span>
        </span>
      )}
    </button>
  );
}
