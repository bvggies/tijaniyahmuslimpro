import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  leftIcon?: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed shadow-soft';

const variants: Record<Variant, string> = {
  primary:
    'bg-emerald-400 text-slate-950 hover:bg-emerald-300 active:scale-[0.97]',
  secondary:
    'bg-slate-900/70 text-emerald-100 border border-emerald-400/30 hover:bg-slate-900/90 active:scale-[0.97]',
  ghost:
    'bg-transparent text-emerald-100 hover:bg-emerald-400/5 border border-transparent active:scale-[0.97]',
};

export function Button({ variant = 'primary', leftIcon, children, className = '', ...rest }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {leftIcon && <span className="inline-flex h-4 w-4 items-center justify-center">{leftIcon}</span>}
      <span>{children}</span>
    </button>
  );
}


