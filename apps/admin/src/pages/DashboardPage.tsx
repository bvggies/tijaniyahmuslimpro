import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users,
  Heart,
  HelpCircle,
  TrendingUp,
  Activity,
  DollarSign,
  MessageSquare,
  Calendar,
  Eye,
  ArrowUpRight,
} from 'lucide-react';
import { Card } from '../components/ui';
import { useAuth } from '../auth';
import { apiRequest } from '../lib/api';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
  description?: string;
  trend?: 'up' | 'down';
}

function StatCard({ title, value, change, icon, color, description, trend }: StatCardProps) {
  const colorMap: Record<string, { bg: string; icon: string; gradient: string }> = {
    'bg-blue-500': {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600',
    },
    'bg-red-500': {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      gradient: 'from-red-500 to-red-600',
    },
    'bg-yellow-500': {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      gradient: 'from-yellow-500 to-yellow-600',
    },
    'bg-green-500': {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      gradient: 'from-green-500 to-green-600',
    },
    'bg-purple-500': {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600',
    },
    'bg-indigo-500': {
      bg: 'bg-indigo-50',
      icon: 'text-indigo-600',
      gradient: 'from-indigo-500 to-indigo-600',
    },
    'bg-pink-500': {
      bg: 'bg-pink-50',
      icon: 'text-pink-600',
      gradient: 'from-pink-500 to-pink-600',
    },
    'bg-teal-500': {
      bg: 'bg-teal-50',
      icon: 'text-teal-600',
      gradient: 'from-teal-500 to-teal-600',
    },
  };

  const colors = colorMap[color] || { bg: 'bg-gray-50', icon: 'text-gray-600', gradient: 'from-gray-500 to-gray-600' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden"
      style={{
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)';
      }}
    >
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />
      
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors.bg} group-hover:scale-110 transition-transform duration-300`}>
          <div className={colors.icon}>
            {icon}
          </div>
        </div>
        {change && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            trend === 'up' 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div>
        <div 
          className="text-3xl font-bold mb-1"
          style={{
            background: 'linear-gradient(to bottom right, #0A3D35, #18F59B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {value}
        </div>
        <div className="text-sm font-medium text-gray-700 mb-1">{title}</div>
        {description && (
          <div className="text-xs text-gray-500 mt-1">{description}</div>
        )}
      </div>
    </motion.div>
  );
}

export function DashboardPage() {
  const { accessToken } = useAuth();

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [users, campaigns, tickets, analytics] = await Promise.all([
        apiRequest<{ users: any[] }>('/api/admin-users', {}, accessToken).catch(() => ({ users: [] })),
        apiRequest<{ campaigns: any[] }>('/api/admin-campaigns-analytics', {}, accessToken).catch(() => ({ campaigns: [] })),
        apiRequest<{ tickets: any[] }>('/api/admin-support-tickets', {}, accessToken).catch(() => ({ tickets: [] })),
        apiRequest<{ analytics: any }>('/api/admin-campaigns-analytics', {}, accessToken).catch(() => ({ analytics: null })),
      ]);

      const totalUsers = users.users?.length || 0;
      const activeCampaigns = campaigns.campaigns?.filter((c: any) => c.isActive)?.length || 0;
      const openTickets = tickets.tickets?.filter((t: any) => t.status === 'open')?.length || 0;
      const totalRevenue = analytics?.analytics?.totalRevenue || 0;

      return {
        totalUsers,
        activeCampaigns,
        openTickets,
        totalRevenue,
        activeSessions: 0, // Would need separate endpoint
        messagesToday: 0, // Would need separate endpoint
        upcomingEvents: 0, // Would need separate endpoint
        growthRate: '24.8%',
      };
    },
    enabled: !!accessToken,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const stats = [
    {
      title: 'Total Users',
      value: statsData?.totalUsers || 0,
      change: '+12.5%',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      description: 'Registered users',
      trend: 'up' as const,
    },
    {
      title: 'Active Campaigns',
      value: statsData?.activeCampaigns || 0,
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-red-500',
      description: 'Donation campaigns',
    },
    {
      title: 'Open Support Tickets',
      value: statsData?.openTickets || 0,
      change: '-2',
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-yellow-500',
      description: 'Requires attention',
      trend: 'down' as const,
    },
    {
      title: 'Total Revenue',
      value: `$${((statsData?.totalRevenue || 0) / 100).toLocaleString()}`,
      change: '+8.2%',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500',
      description: 'From donations',
      trend: 'up' as const,
    },
    {
      title: 'Active Sessions',
      value: statsData?.activeSessions || 0,
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-purple-500',
      description: 'Users online now',
    },
    {
      title: 'Messages Today',
      value: statsData?.messagesToday || 0,
      change: '+15%',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-indigo-500',
      description: 'Chat messages',
      trend: 'up' as const,
    },
    {
      title: 'Upcoming Events',
      value: statsData?.upcomingEvents || 0,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-pink-500',
      description: 'This week',
    },
    {
      title: 'Growth Rate',
      value: statsData?.growthRate || '0%',
      change: '+3.2%',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-teal-500',
      description: 'Month-over-month',
      trend: 'up' as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="w-12 h-12 rounded-full border-4 border-[#18F59B] border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <div className="text-gray-600 font-medium">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 text-white"
        style={{
          background: 'linear-gradient(to bottom right, #0A3D35, #0d4d42, #18F59B)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -ml-24 -mb-24" />
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
            Welcome back! 
            <motion.span
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              👋
            </motion.span>
          </h2>
          <p className="text-white/90 text-lg">Here's what's happening with your platform today.</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card 
          className="border-gray-100"
          style={{
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h3 
              className="text-xl font-bold"
              style={{
                background: 'linear-gradient(to right, #0A3D35, #18F59B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Recent Activity
            </h3>
            <button className="text-sm font-semibold text-[#18F59B] hover:text-[#0A3D35] transition-colors flex items-center gap-1 group">
              View all
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-[#18F59B]/30 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#18F59B]/20 to-[#0A3D35]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-[#18F59B]" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">New user registered</div>
                <div className="text-xs text-gray-500 mt-0.5">2 minutes ago</div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">New donation received</div>
                <div className="text-xs text-gray-500 mt-0.5">15 minutes ago</div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-yellow-300 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HelpCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">Support ticket opened</div>
                <div className="text-xs text-gray-500 mt-0.5">1 hour ago</div>
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
