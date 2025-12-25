import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Shield,
  User,
  Wrench,
  Settings,
  Smile,
  Home
} from 'lucide-react';
import { IslamicBackground } from '@tmp/ui';
import { useAuth } from '../auth';

type DemoRole = 'admin' | 'manager' | 'cleaner' | 'maintenance' | 'guest';

interface RoleOption {
  id: DemoRole;
  label: string;
  icon: React.ReactNode;
}

const roleOptions: RoleOption[] = [
  { 
    id: 'admin', 
    label: 'Admin', 
    icon: <Shield className="w-5 h-5" />
  },
  { 
    id: 'manager', 
    label: 'Manager', 
    icon: <User className="w-5 h-5" />
  },
  { 
    id: 'cleaner', 
    label: 'Cleaner', 
    icon: <Wrench className="w-5 h-5" />
  },
  { 
    id: 'maintenance', 
    label: 'Maintenance', 
    icon: <Settings className="w-5 h-5" />
  },
  { 
    id: 'guest', 
    label: 'Guest', 
    icon: <Smile className="w-5 h-5" />
  },
];

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<DemoRole>('admin');

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
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        {/* Animated Islamic geometric patterns in background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating geometric shapes with animations */}
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 opacity-8"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M50,10 L60,40 L90,40 L65,60 L75,90 L50,75 L25,90 L35,60 L10,40 L40,40 Z"
                fill="none"
                stroke="#18F59B"
                strokeWidth="1"
                opacity="0.2"
              />
              <circle cx="50" cy="50" r="30" fill="none" stroke="#18F59B" strokeWidth="1" opacity="0.15" />
            </svg>
          </motion.div>

          <motion.div
            className="absolute bottom-32 right-16 w-24 h-24 opacity-8"
            animate={{
              rotate: [360, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,5 95,50 50,95 5,50"
                fill="none"
                stroke="#0A3D35"
                strokeWidth="1"
                opacity="0.3"
              />
              <polygon
                points="50,20 80,50 50,80 20,50"
                fill="none"
                stroke="#18F59B"
                strokeWidth="1"
                opacity="0.2"
              />
            </svg>
          </motion.div>

          <motion.div
            className="absolute top-1/2 left-1/4 w-16 h-16 opacity-6"
            animate={{
              rotate: [0, -360],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M50,10 L60,40 L90,40 L65,60 L75,90 L50,75 L25,90 L35,60 L10,40 L40,40 Z"
                fill="none"
                stroke="#18F59B"
                strokeWidth="1"
                opacity="0.2"
              />
            </svg>
          </motion.div>

          {/* Animated background glow effects */}
          <motion.div
            className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-[#18F59B]/10 blur-3xl"
            animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-[-6rem] right-[-3rem] w-96 h-96 rounded-full bg-[#0A3D35]/30 blur-3xl"
            animate={{ y: [0, 18, 0], x: [0, -12, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Main container - white rounded card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-6xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 min-h-[600px]">
              {/* Left Section - Promotional Content */}
              <div className="bg-gray-100 p-12 flex flex-col justify-between relative overflow-hidden">
                {/* Subtle Islamic pattern overlay */}
                <div className="absolute inset-0 opacity-[0.02]">
                  <svg className="w-full h-full" viewBox="0 0 400 400">
                    <defs>
                      <pattern id="islamic-pattern-left" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path
                          d="M50,10 L60,40 L90,40 L65,60 L75,90 L50,75 L25,90 L35,60 L10,40 L40,40 Z"
                          fill="none"
                          stroke="#0A3D35"
                          strokeWidth="0.5"
                        />
                        <circle cx="50" cy="50" r="20" fill="none" stroke="#0A3D35" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#islamic-pattern-left)" />
                  </svg>
                </div>

                <div className="relative z-10">
                  {/* Branding - Logo and Name */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 mb-12"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#18F59B] via-[#0E5146] to-[#0A3D35] flex items-center justify-center shadow-lg">
                      <Home className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[#0A3D35]">Tijaniyah</div>
                      <div className="text-base text-[#0A3D35]/70 font-medium">Muslim Pro</div>
                    </div>
                  </motion.div>

                  {/* Headline */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                  >
                    <h1 className="text-4xl font-bold mb-4 leading-tight">
                      <span className="text-[#0A3D35]">Elevate Your</span>{' '}
                      <span className="text-[#18F59B]">Admin Experience</span>
                    </h1>
                    <p className="text-[#0A3D35]/80 text-base leading-relaxed">
                      Streamline operations, automate tasks, and maximize engagement with Tijaniyah Muslim Pro's all-in-one admin dashboard solution.
                    </p>
                  </motion.div>
                </div>

                {/* Key Metrics Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative z-10 grid grid-cols-2 gap-4"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <div className="text-4xl font-bold text-[#0A3D35] mb-2">98%</div>
                    <div className="text-[#0A3D35]/70 text-sm font-medium">User Satisfaction</div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <div className="text-4xl font-bold text-[#0A3D35] mb-2">24/7</div>
                    <div className="text-[#0A3D35]/70 text-sm font-medium">System Uptime</div>
                  </div>
                </motion.div>
              </div>

              {/* Right Section - Login Form */}
              <div className="bg-gray-100 p-12 flex flex-col justify-center">
                {/* Welcome Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                  <p className="text-gray-600 text-sm">Please sign in to access your dashboard.</p>
                </motion.div>

                {/* Demo Role Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8"
                >
                  <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                    SELECT DEMO ROLE
                  </label>
                  <div className="flex gap-3">
                    {roleOptions.map((role) => (
                      <motion.button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-full border-2 transition-all ${
                          selectedRole === role.id
                            ? 'bg-gradient-to-br from-[#0A3D35] to-[#18F59B] border-[#18F59B] text-white shadow-lg'
                            : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <div className={`${selectedRole === role.id ? 'text-white' : 'text-gray-400'}`}>
                          {role.icon}
                        </div>
                        <span className="text-xs font-medium">{role.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#18F59B]/50 focus:border-[#18F59B] transition-all text-gray-900 placeholder-gray-400"
                        autoComplete="email"
                        disabled={loading}
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <button
                        type="button"
                        className="text-xs text-[#18F59B] hover:text-[#0A3D35] transition-colors font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#18F59B]/50 focus:border-[#18F59B] transition-all text-gray-900 placeholder-gray-400"
                        autoComplete="current-password"
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2"
                    >
                      <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                        !
                      </span>
                      <span className="flex-1">{error}</span>
                    </motion.div>
                  )}

                  {/* Sign In Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.02 } : undefined}
                    whileTap={!loading ? { scale: 0.98 } : undefined}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0A3D35] to-[#18F59B] px-4 py-3.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all"
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
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Copyright */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-8 text-center text-xs text-gray-500"
                >
                  © {new Date().getFullYear()} Tijaniyah Muslim Pro. All rights reserved.
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </IslamicBackground>
  );
}
