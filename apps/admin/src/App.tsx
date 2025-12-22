import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { IslamicBackground, Card } from '@tmp/ui';
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

function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <IslamicBackground>
      <div className="min-h-screen flex">
        <aside className="hidden md:block w-60 border-r border-emerald-400/15 bg-slate-950/40 backdrop-blur-xl">
          <div className="px-4 py-5 border-b border-emerald-400/15">
            <div className="text-sm font-semibold text-emerald-100">Tijaniyah Admin</div>
            <div className="text-[11px] text-emerald-100/60">Supervision & moderation</div>
          </div>
          <nav className="px-3 py-4 space-y-1 text-sm">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/users">Users</NavLink>
            <NavLink to="/scholars">Scholars</NavLink>
            <NavLink to="/events">Events</NavLink>
            <NavLink to="/notifications">Notifications</NavLink>
            <NavLink to="/duas">Duas</NavLink>
            <NavLink to="/community">Community moderation</NavLink>
            <NavLink to="/chat">Chat moderation</NavLink>
            <NavLink to="/donations">Donations</NavLink>
            <NavLink to="/support">Support tickets</NavLink>
            <NavLink to="/release-notes">Release notes</NavLink>
            <NavLink to="/waitlist">Waitlist & contacts</NavLink>
            <NavLink to="/makkah-streams">Makkah Streams</NavLink>
            <NavLink to="/settings">App settings</NavLink>
          </nav>
        </aside>
        <main className="flex-1 px-4 md:px-8 py-6 overflow-y-auto">
          <Card className="mb-4 px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-emerald-100/70">Signed in as</div>
              <div className="text-sm text-emerald-50 font-semibold">
                {user?.email} · {user?.role}
              </div>
            </div>
            <button className="text-xs text-emerald-100/80 underline" onClick={logout}>
              Sign out
            </button>
          </Card>
          {children}
        </main>
      </div>
    </IslamicBackground>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-xl px-3 py-2 text-emerald-100/80 hover:bg-emerald-400/10 hover:text-emerald-50 transition-colors"
    >
      <span>{children}</span>
    </Link>
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


