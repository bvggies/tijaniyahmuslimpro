import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../auth';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (err) {
      setError((err as Error).message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#062F2A]"
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-[#18F59B]/12 blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-6rem] right-[-3rem] w-96 h-96 rounded-full bg-[#0A3D35]/40 blur-3xl"
          animate={{ y: [0, 18, 0], x: [0, -12, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.65)] overflow-hidden">
          {/* Header strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#18F59B]/80 via-[#0A3D35] to-[#18F59B]/60" />

          <div className="px-8 pt-8 pb-9">
            {/* Brand / Logo */}
            <div className="flex items-center justify-center mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#18F59B]/16 via-[#0A3D35]/70 to-[#042822] border border-white/20 shadow-[0_18px_45px_rgba(0,0,0,0.85)] flex items-center justify-center"
              >
                <Lock className="w-8 h-8 text-[#18F59B]" />
              </motion.div>
            </div>

            {/* Titles */}
            <div className="text-center mb-8 space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Admin Login
              </h1>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">
                Tijaniyah Muslim Pro · Control Panel
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="flex items-center justify-between text-xs font-medium text-white/80"
                >
                  <span>Email address</span>
                  <span className="text-[10px] text-white/45">Use your admin email</span>
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="superadmin@tijaniyahmuslimpro.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white/8 text-sm text-white placeholder-white/35 border border-white/14 focus:outline-none focus:ring-2 focus:ring-[#18F59B]/40 focus:border-[#18F59B]/70 transition-all [box-shadow:0_0_0_1px_rgba(255,255,255,0.02)]"
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="password"
                    className="font-medium text-white/80"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[11px] text-[#18F59B]/80 hover:text-[#18F59B] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white/8 text-sm text-white placeholder-white/35 border border-white/14 focus:outline-none focus:ring-2 focus:ring-[#18F59B]/40 focus:border-[#18F59B]/70 transition-all [box-shadow:0_0_0_1px_rgba(255,255,255,0.02)]"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/75 transition-colors"
                    disabled={loading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-red-400/35 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-100 flex items-start gap-2"
                >
                  <span className="mt-[2px] inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500/40 text-[10px] font-semibold">
                    !
                  </span>
                  <span className="flex-1 leading-relaxed">{error}</span>
                </motion.div>
              )}

              {/* Sign in button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { y: -1, boxShadow: '0 14px 40px rgba(0,0,0,0.8)' } : undefined}
                whileTap={!loading ? { scale: 0.97 } : undefined}
                className="w-full mt-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0A3D35] to-[#0E5146] px-4 py-2.75 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(0,0,0,0.85)] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <motion.span
                      className="inline-flex h-4 w-4 rounded-full border-2 border-white/30 border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    <span>Signing you in…</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign in</span>
                  </>
                )}
              </motion.button>

              {/* Hint for seeded logins */}
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-[11px] text-white/65">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-white/80">Seeded super admin</span>
                  <span className="rounded-full bg-black/40 px-2 py-[2px] text-[10px] text-[#18F59B] border border-[#18F59B]/35">
                    SUPER_ADMIN
                  </span>
                </div>
                <p className="leading-relaxed">
                  <span className="text-white/80">Email:</span>{' '}
                  superadmin@tijaniyahmuslimpro.com
                </p>
                <p className="leading-relaxed">
                  <span className="text-white/80">Password:</span>{' '}
                  SuperAdmin123!@#
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-[11px] text-white/45">
          © {new Date().getFullYear()} Tijaniyah Muslim Pro · Admin Console
        </div>
      </motion.div>
    </div>
  );
}
