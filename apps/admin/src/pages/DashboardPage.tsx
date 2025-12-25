import { motion } from 'framer-motion';
import { Users, Heart, HelpCircle, TrendingUp, Activity, DollarSign, MessageSquare, Calendar } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

function StatCard({ title, value, change, icon, color, description }: StatCardProps) {
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
          <div className="flex items-center gap-1 text-xs font-medium text-green-600">
            <TrendingUp className="w-3 h-3" />
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
  const stats = [
    {
      title: 'Total Users',
      value: '1,245',
      change: '+12.5%',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      description: 'Active registered users',
    },
    {
      title: 'Active Campaigns',
      value: '3',
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-red-500',
      description: 'Donation campaigns currently live',
    },
    {
      title: 'Open Support Tickets',
      value: '7',
      change: '-2',
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-yellow-500',
      description: 'Requires immediate attention',
    },
    {
      title: 'Monthly Revenue',
      value: '$12,450',
      change: '+8.2%',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500',
      description: 'From donations and subscriptions',
    },
    {
      title: 'Active Sessions',
      value: '342',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-purple-500',
      description: 'Users currently online',
    },
    {
      title: 'Messages Today',
      value: '1,234',
      change: '+15%',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-indigo-500',
      description: 'Chat and community messages',
    },
    {
      title: 'Upcoming Events',
      value: '5',
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-pink-500',
      description: 'Scheduled for this week',
    },
    {
      title: 'Growth Rate',
      value: '24.8%',
      change: '+3.2%',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-teal-500',
      description: 'Month-over-month growth',
    },
  ];

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

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50"
      >
        <h3 className="text-lg font-semibold text-[#0A3D35] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add User', icon: <Users className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
            { label: 'Create Event', icon: <Calendar className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
            { label: 'Send Notification', icon: <Activity className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
            { label: 'View Reports', icon: <TrendingUp className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
          ].map((action) => (
            <button
              key={action.label}
              className={`${action.color} p-4 rounded-xl hover:scale-105 transition-transform flex flex-col items-center gap-2 font-medium`}
            >
              {action.icon}
              <span className="text-sm">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
