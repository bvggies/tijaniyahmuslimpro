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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <div className={color.replace('bg-', 'text-')}>
            {icon}
          </div>
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className="mb-1">
        <div className="text-3xl font-bold text-[#0A3D35]">{value}</div>
        <div className="text-sm text-gray-600 mt-1">{title}</div>
      </div>
      {description && (
        <div className="text-xs text-gray-500 mt-2">{description}</div>
      )}
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
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#0A3D35] to-[#18F59B] rounded-2xl p-8 text-white shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-2">Welcome back! 👋</h2>
        <p className="text-white/90">Here's what's happening with your platform today.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#0A3D35]">Recent Activity</h3>
            <button className="text-sm text-[#18F59B] hover:text-[#0A3D35] font-medium">
              View all
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[#18F59B]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#18F59B]" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">New user registered</div>
                <div className="text-xs text-gray-500">2 minutes ago</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">New donation received</div>
                <div className="text-xs text-gray-500">15 minutes ago</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Support ticket opened</div>
                <div className="text-xs text-gray-500">1 hour ago</div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
