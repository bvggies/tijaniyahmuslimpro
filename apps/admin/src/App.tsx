import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Home
} from 'lucide-react';
import { IslamicBackground } from '@tmp/ui';
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
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: '/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
  { to: '/scholars', label: 'Scholars', icon: <GraduationCap className="w-5 h-5" /> },
  { to: '/events', label: 'Events', icon: <Calendar className="w-5 h-5" /> },
  { to: '/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
  { to: '/duas', label: 'Duas', icon: <BookOpen className="w-5 h-5" /> },
  { to: '/community', label: 'Community', icon: <MessageSquare className="w-5 h-5" /> },
  { to: '/chat', label: 'Chat Moderation', icon: <MessageCircle className="w-5 h-5" /> },
  { to: '/donations', label: 'Donations', icon: <Heart className="w-5 h-5" /> },
  { to: '/support', label: 'Support Tickets', icon: <HelpCircle className="w-5 h-5" /> },
  { to: '/release-notes', label: 'Release Notes', icon: <FileText className="w-5 h-5" /> },
  { to: '/waitlist', label: 'Waitlist', icon: <UserPlus className="w-5 h-5" /> },
  { to: '/makkah-streams', label: 'Makkah Streams', icon: <Video className="w-5 h-5" /> },
  { to: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <IslamicBackground>
      <div className="min-h-screen flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            x: sidebarOpen ? 0 : '-100%',
          }}
          className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl md:shadow-none flex flex-col transition-transform duration-300`}
        >
          {/* Logo/Brand */}
          <div className="px-6 py-6 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#18F59B] via-[#0E5146] to-[#0A3D35] flex items-center justify-center shadow-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-base font-bold text-[#0A3D35]">Tijaniyah</div>
                <div className="text-xs text-[#0A3D35]/70 font-medium">Admin Dashboard</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0A3D35] to-[#18F59B] text-white shadow-lg shadow-[#18F59B]/20'
                      : 'text-gray-700 hover:bg-gray-100/80 hover:text-[#0A3D35]'
                  }`}
                >
                  <div className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#18F59B]'} transition-colors`}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="px-4 py-4 border-t border-gray-200/50">
            <div className="px-4 py-3 bg-gray-50/80 rounded-xl mb-3">
              <div className="text-xs text-gray-500 mb-1">Signed in as</div>
              <div className="text-sm font-semibold text-[#0A3D35] truncate">{user?.email}</div>
              <div className="text-xs text-gray-500 mt-1">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all group"
            >
              <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition-colors" />
              <span className="text-sm font-medium">Sign out</span>
            </button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
            <div className="px-4 md:px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <div>
                  <h1 className="text-xl font-bold text-[#0A3D35]">
                    {navItems.find(item => item.to === location.pathname)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-xs text-gray-500">Manage and monitor your platform</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-[#18F59B] animate-pulse"></div>
                  <span className="text-xs text-gray-600">System Online</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 px-4 md:px-8 py-6 overflow-y-auto bg-gray-50/50">
            {children}
          </main>
        </div>
      </div>
    </IslamicBackground>
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
                <Route
                  path="/dashboard"
                  element={
                    <RequireRole roles={['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CONTENT_MANAGER']}>
                      <DashboardPage />
                    </RequireRole>
                  }
                />
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
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Shell>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
