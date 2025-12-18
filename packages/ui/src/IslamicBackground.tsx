import type { ReactNode } from 'react';

interface IslamicBackgroundProps {
  children: ReactNode;
  className?: string;
}

export function IslamicBackground({ children, className = '' }: IslamicBackgroundProps) {
  return (
    <div className={`relative min-h-screen bg-islamic-linear overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-islamic-radial opacity-90" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full border border-emerald-300/20 bg-gradient-to-br from-dark-teal/40 to-emerald-400/20 blur-3xl animate-glow-ring" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full border border-emerald-300/10 bg-gradient-to-tr from-emerald-400/20 to-pine-blue/30 blur-2xl animate-glow-ring" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}


