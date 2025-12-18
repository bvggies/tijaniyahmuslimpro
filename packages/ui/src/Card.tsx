import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-emerald-400/15 bg-slate-950/40 backdrop-blur-xl shadow-soft ${className}`}
    >
      {children}
    </div>
  );
}


