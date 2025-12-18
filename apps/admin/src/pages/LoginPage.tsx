import { FormEvent, useState } from 'react';
import { useAuth } from '../auth';
import { IslamicBackground, Card, Button } from '@tmp/ui';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await login(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IslamicBackground>
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md px-6 py-5">
          <h1 className="text-lg font-semibold text-emerald-50 mb-1">Admin sign in</h1>
          <p className="text-[11px] text-emerald-100/70 mb-4">
            Restricted area for SUPER_ADMIN, ADMIN, MODERATOR, and CONTENT_MANAGER roles.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] text-emerald-100/80">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-sm text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-emerald-100/80">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-sm text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                required
              />
            </div>
            {error && <p className="text-[11px] text-red-300">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </Card>
      </div>
    </IslamicBackground>
  );
}



