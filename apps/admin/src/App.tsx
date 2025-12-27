import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  Bell,
  BookOpen,
  MessageSquare,
  MessageCircle,
  Heart,
  HelpCircle,
  FileText,
  UserPlus,
  Video,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  ChevronRight,
} from 'lucide-react';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { ScholarsPage } from './pages/ScholarsPage';
import { DuasPage } from './pages/DuasPage';
import { EventsPage } from './pages/EventsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { CommunityModerationPage } from './pages/CommunityModerationPage';
import { ChatModerationPage } from './pages/ChatModerationPage';
import { DonationsPage } from './pages/DonationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SupportTicketsPage } from './pages/SupportTicketsPage';
import { ReleaseNotesPage } from './pages/ReleaseNotesPage';
import { WaitlistPage } from './pages/WaitlistPage';
import { MakkahStreamsPage } from './pages/MakkahStreamsPage';
import { LoginPage } from './pages/LoginPage';
import { RequireAuth, RequireRole, useAuth } from './auth';
import { useState } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CONTENT_MANAGER'] },
  { to: '/users', icon: Users, label: 'Users', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { to: '/scholars', icon: GraduationCap, label: 'Scholars', roles: ['SUPER_ADMIN', 'CONTENT_MANAGER'] },
  { to: '/events', icon: Calendar, label: 'Events', roles: ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'] },
  { to: '/notifications', icon: Bell, label: 'Notifications', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { to: '/duas', icon: BookOpen, label: 'Duas', roles: ['SUPER_ADMIN', 'CONTENT_MANAGER'] },
  { to: '/community', icon: MessageSquare, label: 'Community Moderation', roles: ['SUPER_ADMIN', 'MODERATOR'] },
  { to: '/chat', icon: MessageCircle, label: 'Chat Moderation', roles: ['SUPER_ADMIN', 'MODERATOR'] },
  { to: '/donations', icon: Heart, label: 'Donations', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { to: '/support', icon: HelpCircle, label: 'Support Tickets', roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] },
  { to: '/release-notes', icon: FileText, label: 'Release Notes', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { to: '/waitlist', icon: UserPlus, label: 'Waitlist & Contacts', roles: ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'] },
  { to: '/makkah-streams', icon: Video, label: 'Makkah Streams', roles: ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'] },
  { to: '/settings', icon: Settings, label: 'App Settings', roles: ['SUPER_ADMIN'] },
];

function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentPath = location.pathname;
  const breadcrumbs = currentPath.split('/').filter(Boolean);

  const filteredNavItems = navItems.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: isSidebarOpen ? 0 : -250 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-modern-lg flex flex-col md:relative md:translate-x-0 md:shadow-none"
      >
        {/* Sidebar Header */}
        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-br from-white to-gray-50/50">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#18F59B] to-[#0A3D35] flex items-center justify-center shadow-lg"
            >
              <Home className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-[#0A3D35] to-[#18F59B] bg-clip-text text-transparent">
                Tijaniyah
              </div>
              <div className="text-xs text-gray-500 font-medium">Admin Panel</div>
            </div>
          </div>
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors" 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-modern">
          {filteredNavItems.map((item) => {
            const isActive = currentPath === item.to;
            const Icon = item.icon;
            return (
              <motion.div
                key={item.to}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={item.to}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0A3D35] to-[#18F59B] text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-[#0A3D35]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-[#0A3D35] to-[#18F59B] rounded-xl -z-0"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-[#18F59B]'}`} />
                  <span className={`font-semibold relative z-10 ${isActive ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="px-4 py-5 border-t border-gray-100 bg-gradient-to-br from-gray-50/50 to-white">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#18F59B] to-[#0A3D35] flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">{user?.email}</div>
              <div className="text-xs text-gray-500 font-medium">{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-all shadow-sm hover:shadow-md"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100/50 shadow-sm px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0A3D35] to-[#18F59B] bg-clip-text text-transparent capitalize">
              {breadcrumbs.length > 0 ? (
                <div className="flex items-center gap-2">
                  {breadcrumbs.map((crumb, index) => (
                    <span key={crumb} className="flex items-center">
                      {crumb.replace(/-/g, ' ')}
                      {index < breadcrumbs.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                'Dashboard'
              )}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50 scrollbar-modern">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPath}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <Shell>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route
                  path="/users"
                  element={
                    <RequireRole roles={['SUPER_ADMIN', 'ADMIN']}>
                      <UsersPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/scholars"
                  element={
                    <RequireRole roles={['SUPER_ADMIN', 'CONTENT_MANAGER']}>
                      <ScholarsPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/events"
                  element={
                    <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']}>
                      <EventsPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <RequireRole roles={['SUPER_ADMIN', 'ADMIN']}>
                      <NotificationsPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/duas"
                  element={
                    <RequireRole roles={['SUPER_ADMIN', 'CONTENT_MANAGER']}>
                      <DuasPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/community"
                  element={
                    <RequireRole roles={['SUPER_ADMIN', 'MODERATOR']}>
                      <CommunityModerationPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <RequireRole roles={['SUPER_ADMIN', 'MODERATOR']}>
                      <ChatModerationPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/donations"
                  element={
                    <RequireRole roles={['SUPER_ADMIN', 'ADMIN']}>
                      <DonationsPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/support"
                  element={
                    <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'MODERATOR']}>
                      <SupportTicketsPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/release-notes"
                  element={
                    <RequireRole roles={['SUPER_ADMIN', 'ADMIN']}>
                      <ReleaseNotesPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/waitlist"
                  element={
                    <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']}>
                      <WaitlistPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/makkah-streams"
                  element={
                    <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']}>
                      <MakkahStreamsPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <RequireRole roles={['SUPER_ADMIN']}>
                      <SettingsPage />
                    </RequireRole>
                  }
                />
              </Routes>
            </Shell>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
