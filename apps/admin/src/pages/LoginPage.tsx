import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Github, Facebook } from 'lucide-react';
import { useAuth } from '../auth';
import { BackgroundScene } from '../components/BackgroundScene';

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

    // Validation
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
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
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden" style={{ background: 'linear-gradient(135deg, #062F2A 0%, #073E36 50%, #042822 100%)' }}>
      <BackgroundScene />

      {/* Center Glass Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/15 shadow-xl relative overflow-hidden">
          {/* Inner highlight */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          <div className="relative px-8 py-10">
            {/* App Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#18F59B]/20 to-[#0E5146]/30 border border-[#18F59B]/30 flex items-center justify-center backdrop-blur-sm">
                <Lock className="w-10 h-10 text-[#18F59B]" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white text-center mb-2">Admin Login</h1>
            <p className="text-sm text-white/65 text-center mb-8">
              Tijaniyah Muslim Pro – Admin Panel
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white/80">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@tijaniyahmuslimpro.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/12 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#18F59B]/40 focus:border-[#18F59B]/40 transition-all focus:-translate-y-0.5"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white/80">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/12 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#18F59B]/40 focus:border-[#18F59B]/40 transition-all focus:-translate-y-0.5"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-start">
                <button
                  type="button"
                  className="text-sm text-[#18F59B] hover:text-[#18F59B]/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-400 text-xs">!</span>
                  </div>
                  <p className="text-sm text-red-300 flex-1">{error}</p>
                </motion.div>
              )}

              {/* Primary Sign In Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl bg-[#0A3D35] text-white font-semibold hover:bg-[#0E5146] hover:shadow-[0_0_25px_rgba(24,245,155,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign in</span>
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative flex items-center py-4">
                <div className="flex-1 border-t border-white/10" />
                <span className="px-4 text-sm text-white/50">or continue with</span>
                <div className="flex-1 border-t border-white/10" />
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="aspect-square rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all"
                >
                  <svg className="w-6 h-6 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="aspect-square rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all"
                >
                  <Github className="w-6 h-6 text-white/70" />
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="aspect-square rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all"
                >
                  <Facebook className="w-6 h-6 text-white/70" />
                </motion.button>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-white/10">
                <p className="text-xs text-white/50 text-center">
                  © Tijaniyah Muslim Pro
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Mobile: Reduce shape opacity */}
      <style>{`
        @media (max-width: 640px) {
          .absolute.top-20.left-10,
          .absolute.bottom-32.right-16,
          .absolute.top-1\\/2.left-1\\/4,
          .absolute.bottom-20.left-1\\/3 {
            opacity: 0.1 !important;
          }
        }
      `}</style>
    </div>
  );
}
