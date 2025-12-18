import { IslamicBackground, Card, Button } from '@tmp/ui';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';

const appStoreUrl = import.meta.env.VITE_APPSTORE_URL || '#';
const playStoreUrl = import.meta.env.VITE_PLAYSTORE_URL || '#';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function LandingPage() {
  const isComingSoon = appStoreUrl === '#' || playStoreUrl === '#';
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [waitlistMessage, setWaitlistMessage] = useState<string | null>(null);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<string | null>(null);

  const { data: releaseData } = useQuery({
    queryKey: ['publicReleaseNotes'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/release-notes-public`);
      if (!res.ok) throw new Error('Failed to load release notes');
      return (await res.json()) as {
        notes: { id: string; version: string; title: string; body: string; createdAt: string }[];
      };
    },
  });

  const submitWaitlist = async (e: FormEvent) => {
    e.preventDefault();
    setWaitlistMessage(null);
    setWaitlistError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setWaitlistMessage('Added to waitlist. JazakAllahu khayran.');
      setEmail('');
    } catch {
      setWaitlistError('Could not add you right now. Please try again later.');
    }
  };

  const submitContact = async (e: FormEvent) => {
    e.preventDefault();
    setContactStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage,
        }),
      });
      if (!res.ok) throw new Error();
      setContactStatus('Message sent. We will reply as soon as possible in shā’ Allāh.');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch {
      setContactStatus('Unable to send right now. Please try again later.');
    }
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-emerald-400/20 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/')}
            className="text-sm font-semibold text-emerald-50"
          >
            Tijaniyah Muslim Pro
          </button>
          <nav className="hidden md:flex gap-6 text-[13px] text-emerald-100/80">
            <button onClick={() => scrollToId('features')}>Features</button>
            <button onClick={() => scrollToId('faq')}>FAQ</button>
            <button onClick={() => scrollToId('contact')}>Contact</button>
            <button onClick={() => scrollToId('changelog')}>Changelog</button>
            <Link to="/status">Status</Link>
          </nav>
          <Button
            variant="secondary"
            onClick={() => scrollToId('download')}
            className="hidden md:inline-flex text-xs"
          >
            Get the app
          </Button>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-10 md:py-16">
        <section id="home" className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/80 mb-3">
              Inspired by Muslim Pro • Rooted in Tijaniyah
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-emerald-50 mb-4">
              A serene Islamic companion for Salah, Qur&apos;an, Zikr, and community.
            </h1>
            <p className="text-sm text-emerald-100/80 mb-6">
              Prayer times, Qur&apos;an, duas, digital tasbih, Tijaniyah wazifa & lazim tracking, donations, and a
              carefully moderated community — in a single, elegant app.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {!isComingSoon && (
                <>
                  <Button
                    onClick={() => window.open(playStoreUrl, '_blank')}
                    className="text-xs px-5"
                  >
                    Google Play
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => window.open(appStoreUrl, '_blank')}
                    className="text-xs px-5"
                  >
                    App Store
                  </Button>
                </>
              )}
              {isComingSoon && (
                <Card className="px-4 py-3 border-dashed border-emerald-400/40">
                  <div className="text-xs text-emerald-100/80 mb-1">Join the early access list</div>
                  <p className="text-[11px] text-emerald-100/70 mb-2">
                    Store links are not set yet. Leave your email, and we&apos;ll let you know when the app launches.
                  </p>
                  <form onSubmit={submitWaitlist} className="flex gap-2 text-[11px]">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="flex-1 rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                    />
                    <Button type="submit" variant="secondary" className="px-3">
                      Notify me
                    </Button>
                  </form>
                  {waitlistMessage && (
                    <p className="mt-1 text-[11px] text-emerald-200">{waitlistMessage}</p>
                  )}
                  {waitlistError && (
                    <p className="mt-1 text-[11px] text-red-300">{waitlistError}</p>
                  )}
                </Card>
              )}
            </div>
          </div>
          <div className="relative h-72 md:h-80">
            <Card className="absolute inset-0 flex flex-col justify-between px-6 py-5 animate-float-soft">
              <div>
                <div className="text-xs text-emerald-100/80 mb-1">Today • Sample UI</div>
                <div className="text-lg text-emerald-50 font-semibold mb-2">Dhuhr in 1h 12m</div>
                <p className="text-[11px] text-emerald-100/70">
                  Inspired by the clarity of Muslim Pro, with a darker Tijaniyah palette and soft glowing gradients.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-[11px]">
                <Card className="px-3 py-2">
                  <div className="text-emerald-100/80 mb-1">Qur&apos;an</div>
                  <p className="text-emerald-100/70">Surah Al-Kahf • Ayah 10</p>
                </Card>
                <Card className="px-3 py-2">
                  <div className="text-emerald-100/80 mb-1">Tasbih</div>
                  <p className="text-emerald-100/70">33 / 100 • &quot;SubhānAllāh&quot;</p>
                </Card>
                <Card className="px-3 py-2">
                  <div className="text-emerald-100/80 mb-1">Wird</div>
                  <p className="text-emerald-100/70">Lazim • 2 of 3 cycles</p>
                </Card>
              </div>
            </Card>
          </div>
        </section>

        <section id="features" className="space-y-6">
          <h2 className="text-xl font-semibold text-emerald-50">Features</h2>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <Card className="px-4 py-3">
              <h3 className="text-emerald-50 font-semibold mb-1">Prayer & Qibla</h3>
              <p className="text-emerald-100/80">
                Location-aware prayer times, Qibla compass, and configurable calculation methods.
              </p>
            </Card>
            <Card className="px-4 py-3">
              <h3 className="text-emerald-50 font-semibold mb-1">Qur&apos;an & Duas</h3>
              <p className="text-emerald-100/80">
                Read by Surah or Juz, store bookmarks, and access curated duas & supplications.
              </p>
            </Card>
            <Card className="px-4 py-3">
              <h3 className="text-emerald-50 font-semibold mb-1">Tijaniyah Focus</h3>
              <p className="text-emerald-100/80">
                Lazim & wazifa tracking, Zikr Jumma content, and teachings from Tijaniyah scholars.
              </p>
            </Card>
            <Card className="px-4 py-3">
              <h3 className="text-emerald-50 font-semibold mb-1">Community</h3>
              <p className="text-emerald-100/80">
                A respectful feed with likes & comments, plus 1-1 and group chat with moderation tools.
              </p>
            </Card>
            <Card className="px-4 py-3">
              <h3 className="text-emerald-50 font-semibold mb-1">Donations</h3>
              <p className="text-emerald-100/80">
                Transparent campaigns, receipts, and exportable reports from the admin dashboard.
              </p>
            </Card>
            <Card className="px-4 py-3">
              <h3 className="text-emerald-50 font-semibold mb-1">AI Noor</h3>
              <p className="text-emerald-100/80">
                An assistive Islamic AI with a clear fiqh disclaimer, configurable prompts, and audit logs.
              </p>
            </Card>
          </div>
        </section>

        <section id="faq" className="space-y-4">
          <h2 className="text-xl font-semibold text-emerald-50">FAQ</h2>
          <Card className="px-4 py-3 text-sm">
            <p className="text-emerald-100/80 font-semibold mb-1">Is Tijaniyah Muslim Pro free?</p>
            <p className="text-emerald-100/80">
              Core features like prayer times, Qur&apos;an, and duas can be offered for free; advanced features and
              donation integrations are configurable.
            </p>
          </Card>
        </section>

        <section id="contact" className="space-y-4">
          <h2 className="text-xl font-semibold text-emerald-50">Contact & Support</h2>
          <Card className="px-4 py-3 text-sm space-y-3">
            <p className="text-emerald-100/80">
              For support, feature requests, or partnership inquiries, send us a message. We&apos;ll respond as soon as
              we can in shā’ Allāh.
            </p>
            <form onSubmit={submitContact} className="space-y-2 text-[11px]">
              <div className="grid md:grid-cols-2 gap-2">
                <input
                  required
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Your name"
                  className="rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                />
                <input
                  required
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                />
              </div>
              <textarea
                required
                value={contactMessage}
                onChange={e => setContactMessage(e.target.value)}
                placeholder="How can we help?"
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
              />
              <Button type="submit" variant="secondary" className="px-4 py-1.5">
                Send message
              </Button>
            </form>
            {contactStatus && (
              <p className="text-[11px] text-emerald-100/80">{contactStatus}</p>
            )}
          </Card>
        </section>

        <section id="changelog" className="space-y-4">
          <h2 className="text-xl font-semibold text-emerald-50">Changelog & Status</h2>
          <Card className="px-4 py-3 text-sm space-y-2">
            {releaseData?.notes?.length ? (
              releaseData.notes.map(note => (
                <div key={note.id} className="border-b border-emerald-400/20 pb-2 last:border-none">
                  <p className="text-emerald-100/80 mb-1">
                    v{note.version} – {note.title}
                  </p>
                  <p className="text-[11px] text-emerald-100/70 mb-1 whitespace-pre-line">
                    {note.body}
                  </p>
                  <p className="text-[10px] text-emerald-100/60">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-emerald-100/70">
                First public release. Future updates will show here as they ship.
              </p>
            )}
          </Card>
        </section>

        <section id="download" className="space-y-4 pb-10">
          <h2 className="text-xl font-semibold text-emerald-50">Download</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="px-4 py-3 text-sm flex items-center justify-between">
              <div>
                <p className="text-emerald-100/80 mb-1">Scan QR to download</p>
                <p className="text-emerald-100/70 text-xs">Wire this to dynamic QR codes when store links are live.</p>
              </div>
            </Card>
          </div>
        </section>

        <footer className="border-t border-emerald-400/20 py-4 text-[11px] text-emerald-100/70 flex flex-wrap gap-4 justify-between">
          <span>© {new Date().getFullYear()} Tijaniyah Muslim Pro</span>
          <div className="flex gap-4">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/status">Status</Link>
          </div>
        </footer>
      </main>
    </>
  );
}

function PrivacyPage() {
  return (
    <IslamicBackground>
      <main className="mx-auto max-w-3xl px-4 py-10 md:py-16 space-y-4 text-sm text-emerald-100/80">
        <h1 className="text-2xl font-semibold text-emerald-50 mb-2">Privacy Policy</h1>
        <p>
          Tijaniyah Muslim Pro respects your privacy. We collect only the data needed to provide features like prayer
          times, Qur&apos;an bookmarks, tasbih sessions, journal entries, donations, and community functionality.
        </p>
        <p>
          Personal data such as your email, profile information, and usage events are stored securely in our database
          and never sold to third parties. Where we rely on third-party services (for example, for maps or analytics),
          we share only the minimum necessary information.
        </p>
        <p>
          You may request deletion of your account and associated data at any time via the in-app support area or the
          contact form on this site.
        </p>
      </main>
    </IslamicBackground>
  );
}

function TermsPage() {
  return (
    <IslamicBackground>
      <main className="mx-auto max-w-3xl px-4 py-10 md:py-16 space-y-4 text-sm text-emerald-100/80">
        <h1 className="text-2xl font-semibold text-emerald-50 mb-2">Terms of Service</h1>
        <p>
          By using Tijaniyah Muslim Pro, you agree to use the app and community features with adab (proper etiquette)
          and in compliance with applicable laws. You are responsible for the content you post and must not share
          anything harmful, unlawful, or inappropriate.
        </p>
        <p>
          We may update or remove features over time and reserve the right to suspend accounts that abuse the service or
          violate community guidelines.
        </p>
        <p>
          Nothing in the app, including AI Noor responses, constitutes formal religious or legal advice. Always consult
          qualified scholars for fiqh and personal rulings.
        </p>
      </main>
    </IslamicBackground>
  );
}

function StatusPage() {
  const { data } = useQuery({
    queryKey: ['publicReleaseNotes'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/release-notes-public`);
      if (!res.ok) throw new Error('Failed to load status');
      return (await res.json()) as {
        notes: { id: string; version: string; title: string; body: string; createdAt: string }[];
      };
    },
  });

  return (
    <IslamicBackground>
      <main className="mx-auto max-w-3xl px-4 py-10 md:py-16 space-y-4 text-sm text-emerald-100/80">
        <h1 className="text-2xl font-semibold text-emerald-50 mb-2">Status & Updates</h1>
        <p className="text-[13px] text-emerald-100/80 mb-2">
          Service is currently <span className="font-semibold text-emerald-300">operational</span>. Recent updates:
        </p>
        <div className="space-y-2">
          {data?.notes?.length ? (
            data.notes.map(note => (
              <Card key={note.id} className="px-4 py-3 text-xs">
                <p className="text-emerald-50 mb-1">
                  v{note.version} – {note.title}
                </p>
                <p className="text-emerald-100/80 mb-1 whitespace-pre-line">{note.body}</p>
                <p className="text-[10px] text-emerald-100/70">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </Card>
            ))
          ) : (
            <p className="text-emerald-100/70">No status updates yet.</p>
          )}
        </div>
      </main>
    </IslamicBackground>
  );
}

export default function App() {
  return (
    <IslamicBackground>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/status" element={<StatusPage />} />
      </Routes>
    </IslamicBackground>
  );
}

