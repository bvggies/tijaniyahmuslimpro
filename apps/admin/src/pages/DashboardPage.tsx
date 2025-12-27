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
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2, ease: 'easeOut' }
      }}
      style={{
        position: 'relative',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        // Only handle shadow changes, let Framer Motion handle transform via whileHover
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        // Only handle shadow changes, let Framer Motion handle transform via whileHover
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)';
      }}
    >
      {/* Gradient accent bar */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: color === 'bg-blue-500' ? 'linear-gradient(to right, #3b82f6, #2563eb)' :
                      color === 'bg-red-500' ? 'linear-gradient(to right, #ef4444, #dc2626)' :
                      color === 'bg-yellow-500' ? 'linear-gradient(to right, #eab308, #ca8a04)' :
                      color === 'bg-green-500' ? 'linear-gradient(to right, #22c55e, #16a34a)' :
                      color === 'bg-purple-500' ? 'linear-gradient(to right, #a855f7, #9333ea)' :
                      color === 'bg-indigo-500' ? 'linear-gradient(to right, #6366f1, #4f46e5)' :
                      color === 'bg-pink-500' ? 'linear-gradient(to right, #ec4899, #db2777)' :
                      color === 'bg-teal-500' ? 'linear-gradient(to right, #14b8a6, #0d9488)' :
                      'linear-gradient(to right, #6b7280, #4b5563)',
        }}
      />
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div 
          style={{
            padding: '0.75rem',
            borderRadius: '0.75rem',
            backgroundColor: color === 'bg-blue-500' ? '#eff6ff' :
                            color === 'bg-red-500' ? '#fef2f2' :
                            color === 'bg-yellow-500' ? '#fefce8' :
                            color === 'bg-green-500' ? '#f0fdf4' :
                            color === 'bg-purple-500' ? '#faf5ff' :
                            color === 'bg-indigo-500' ? '#eef2ff' :
                            color === 'bg-pink-500' ? '#fdf2f8' :
                            color === 'bg-teal-500' ? '#f0fdfa' :
                            '#f9fafb',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <div 
            style={{
              color: color === 'bg-blue-500' ? '#2563eb' :
                     color === 'bg-red-500' ? '#dc2626' :
                     color === 'bg-yellow-500' ? '#ca8a04' :
                     color === 'bg-green-500' ? '#16a34a' :
                     color === 'bg-purple-500' ? '#9333ea' :
                     color === 'bg-indigo-500' ? '#4f46e5' :
                     color === 'bg-pink-500' ? '#db2777' :
                     color === 'bg-teal-500' ? '#0d9488' :
                     '#4b5563',
            }}
          >
            {icon}
          </div>
        </div>
        {change && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
              backgroundColor: trend === 'up' ? '#f0fdf4' : '#fef2f2',
              color: trend === 'up' ? '#15803d' : '#dc2626',
            }}
          >
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div>
        <div 
          style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            marginBottom: '0.25rem',
            background: 'linear-gradient(to bottom right, #0A3D35, #18F59B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: '1.2',
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>{title}</div>
        {description && (
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{description}</div>
        )}
      </div>
    </motion.div>
  );
}

export function DashboardPage() {
  const { accessToken } = useAuth();

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const data = await apiRequest<{
        stats: {
          totalUsers: number;
          usersThisMonth: number;
          userGrowthRate: string;
          totalCampaigns: number;
          activeCampaigns: number;
          totalDonations: number;
          donationsThisMonth: number;
          openTickets: number;
          totalTickets: number;
          messagesToday: number;
          totalMessages: number;
          upcomingEvents: number;
          totalEvents: number;
          communityPostsToday: number;
          totalCommunityPosts: number;
          notificationsToday: number;
          totalNotifications: number;
        };
        recentActivity: {
          users: Array<{
            id: string;
            email: string;
            name: string | null;
            role: string;
            createdAt: string;
          }>;
          tickets: Array<{
            id: string;
            subject: string;
            status: string;
            userEmail: string;
            userName: string | null;
            createdAt: string;
          }>;
        };
      }>('/api/admin-dashboard-analytics', {}, accessToken).catch(() => ({
        stats: {
          totalUsers: 0,
          usersThisMonth: 0,
          userGrowthRate: '0%',
          totalCampaigns: 0,
          activeCampaigns: 0,
          totalDonations: 0,
          donationsThisMonth: 0,
          openTickets: 0,
          totalTickets: 0,
          messagesToday: 0,
          totalMessages: 0,
          upcomingEvents: 0,
          totalEvents: 0,
          communityPostsToday: 0,
          totalCommunityPosts: 0,
          notificationsToday: 0,
          totalNotifications: 0,
        },
        recentActivity: { users: [], tickets: [] },
      }));

      return data;
    },
    enabled: !!accessToken,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const statsData = analyticsData?.stats;
  const recentActivity = analyticsData?.recentActivity;

  const stats = [
    {
      title: 'Total Users',
      value: statsData?.totalUsers || 0,
      change: statsData?.userGrowthRate ? `+${statsData.userGrowthRate}` : undefined,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      description: 'Registered users',
      trend: parseFloat(statsData?.userGrowthRate || '0') > 0 ? ('up' as const) : undefined,
    },
    {
      title: 'Active Campaigns',
      value: statsData?.activeCampaigns || 0,
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-red-500',
      description: `Out of ${statsData?.totalCampaigns || 0} total`,
    },
    {
      title: 'Open Support Tickets',
      value: statsData?.openTickets || 0,
      change: statsData?.totalTickets ? `${statsData.totalTickets - (statsData.openTickets || 0)} resolved` : undefined,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-yellow-500',
      description: 'Requires attention',
      trend: statsData?.openTickets === 0 ? ('down' as const) : undefined,
    },
    {
      title: 'Total Donations',
      value: `$${((statsData?.totalDonations || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: statsData?.donationsThisMonth ? `${statsData.donationsThisMonth} this month` : undefined,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500',
      description: 'From all campaigns',
      trend: (statsData?.donationsThisMonth || 0) > 0 ? ('up' as const) : undefined,
    },
    {
      title: 'Messages Today',
      value: statsData?.messagesToday || 0,
      change: statsData?.totalMessages ? `${statsData.totalMessages} total` : undefined,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-indigo-500',
      description: 'Chat messages',
      trend: (statsData?.messagesToday || 0) > 0 ? ('up' as const) : undefined,
    },
    {
      title: 'Upcoming Events',
      value: statsData?.upcomingEvents || 0,
      change: statsData?.totalEvents ? `${statsData.totalEvents} total` : undefined,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-pink-500',
      description: 'Scheduled events',
    },
    {
      title: 'Community Posts',
      value: statsData?.communityPostsToday || 0,
      change: statsData?.totalCommunityPosts ? `${statsData.totalCommunityPosts} total` : undefined,
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-purple-500',
      description: 'Posts today',
      trend: (statsData?.communityPostsToday || 0) > 0 ? ('up' as const) : undefined,
    },
    {
      title: 'Notifications Sent',
      value: statsData?.notificationsToday || 0,
      change: statsData?.totalNotifications ? `${statsData.totalNotifications} total` : undefined,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-teal-500',
      description: 'Sent today',
      trend: (statsData?.notificationsToday || 0) > 0 ? ('up' as const) : undefined,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '1.5rem',
          padding: '2rem',
          color: '#ffffff',
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
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        style={{
          gap: '1.5rem',
        }}
      >
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
            {recentActivity?.users && recentActivity.users.length > 0 ? (
              recentActivity.users.slice(0, 3).map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-[#18F59B]/30 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#18F59B]/20 to-[#0A3D35]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-[#18F59B]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      New user: {user.name || user.email}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {user.role} · {new Date(user.createdAt).toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">No recent user activity</div>
            )}
            {recentActivity?.tickets && recentActivity.tickets.length > 0 ? (
              recentActivity.tickets.slice(0, 2).map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-yellow-300 hover:shadow-md transition-all group cursor-pointer ${
                    ticket.status === 'open' ? 'border-yellow-200 bg-yellow-50/30' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{ticket.subject}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {ticket.userName || ticket.userEmail} · {ticket.status} · {new Date(ticket.createdAt).toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              recentActivity?.users && recentActivity.users.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">No recent tickets</div>
              )
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}