import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Home,
  Sparkles
} from 'lucide-react';
import { IslamicBackground } from '@tmp/ui';
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
    <IslamicBackground>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating gradient orbs */}
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-[#18F59B]/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-[#0A3D35]/30 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, -60, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Floating geometric shapes */}
          <motion.div
            className="absolute top-1/4 right-1/4 w-32 h-32 opacity-10"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M50,10 L60,40 L90,40 L65,60 L75,90 L50,75 L25,90 L35,60 L10,40 L40,40 Z"
                fill="none"
                stroke="#18F59B"
                strokeWidth="2"
              />
            </svg>
          </motion.div>
        </div>

        {/* Main Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Decorative top accent */}
            <div className="h-2 bg-gradient-to-r from-[#0A3D35] via-[#18F59B] to-[#0A3D35]" />

            <div className="p-8 md:p-10">
              {/* Logo and Branding */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#18F59B] via-[#0E5146] to-[#0A3D35] flex items-center justify-center shadow-xl">
                    <Home className="w-9 h-9 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-[#0A3D35] mb-2">Welcome Back</h1>
                <p className="text-gray-600 text-sm">Sign in to access your admin dashboard</p>
              </motion.div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#18F59B] transition-colors" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@tijaniyahmuslimpro.com"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#18F59B] focus:bg-white transition-all font-medium"
                      autoComplete="email"
                      disabled={loading}
                      required
                    />
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-xs font-medium text-[#18F59B] hover:text-[#0A3D35] transition-colors"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#18F59B] transition-colors" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#18F59B] focus:bg-white transition-all font-medium"
                      autoComplete="current-password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={loading}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-3"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                    </div>
                    <span className="flex-1">{error}</span>
                  </motion.div>
                )}

                {/* Sign In Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.02, boxShadow: '0 10px 30px rgba(10, 61, 53, 0.3)' } : undefined}
                  whileTap={!loading ? { scale: 0.98 } : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0A3D35] to-[#18F59B] px-6 py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <motion.span
                          className="inline-flex h-5 w-5 rounded-full border-2 border-white/30 border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#18F59B] to-[#0A3D35] opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                  />
                </motion.button>
              </form>

              {/* Footer Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 pt-6 border-t border-gray-200"
              >
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-2">
                  <Sparkles className="w-4 h-4 text-[#18F59B]" />
                  <span>Secure Admin Access</span>
                </div>
                <p className="text-center text-xs text-gray-400">
                  © {new Date().getFullYear()} Tijaniyah Muslim Pro. All rights reserved.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Demo Credentials Hint */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#18F59B]/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#18F59B]" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#0A3D35] mb-1">Demo Credentials</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><span className="font-medium">Email:</span> superadmin@tijaniyahmuslimpro.com</div>
                  <div><span className="font-medium">Password:</span> SuperAdmin123!@#</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </IslamicBackground>
  );
}
