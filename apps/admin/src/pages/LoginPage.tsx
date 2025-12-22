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
                  {/* Generic Google-like icon, monochrome to keep color palette consistent */}
                  <svg className="w-6 h-6 text-white/70" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21.6 12.2273C21.6 11.5818 21.5455 10.9636 21.4455 10.3637H12V13.8728H17.4727C17.2364 15.1273 16.5636 16.1909 15.5364 16.8909V19.1818H18.4727C20.2545 17.5637 21.6 15.1728 21.6 12.2273Z"
                      fill="currentColor"
                    />
                    <path
                      d="M12 21.5C14.7 21.5 16.9636 20.6091 18.4727 19.1818L15.5364 16.8909C14.7182 17.4455 13.6 17.7818 12 17.7818C9.38182 17.7818 7.16364 16.1546 6.37273 13.8H3.32727V16.1637C4.82727 19.3455 8.14545 21.5 12 21.5Z"
                      fill="currentColor"
                    />
                    <path
                      d="M6.37273 13.8C6.16364 13.2455 6.04545 12.6455 6.04545 12C6.04545 11.3545 6.17273 10.7546 6.37273 10.2V7.83636H3.32727C2.70909 9.03636 2.36364 10.4727 2.36364 12C2.36364 13.5273 2.70909 14.9636 3.32727 16.1637L6.37273 13.8Z"
                      fill="currentColor"
                    />
                    <path
                      d="M12 6.21818C13.7455 6.21818 15.2364 6.81818 16.4 7.90909L18.5455 5.76364C16.9545 4.29091 14.7 3.5 12 3.5C8.14545 3.5 4.82727 5.65455 3.32727 8.83636L6.37273 11.2C7.16364 8.84545 9.38182 7.21818 12 7.21818V6.21818Z"
                      fill="currentColor"
                    />
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
