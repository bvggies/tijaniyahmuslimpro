import { useQuery } from '@tanstack/react-query';
import { Card, Button } from '@tmp/ui';
import { useAuth } from '../auth';

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3000';

export function UsersPage() {
  const { accessToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load users');
      return (await res.json()) as { users: UserRow[] };
    },
    enabled: !!accessToken,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-emerald-50">User management</h1>
        <Button variant="secondary">Export users</Button>
      </div>
      <Card className="px-4 py-3 text-xs">
        {isLoading && <div className="text-emerald-100/70">Loading users…</div>}
        {!isLoading && !data?.users?.length && (
          <div className="text-emerald-100/70">No users yet.</div>
        )}
        {data?.users?.length ? (
          <div className="space-y-2">
            {data.users.map(u => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-black/40 px-3 py-2"
              >
                <div>
                  <div className="text-emerald-50 font-semibold">{u.email}</div>
                  <div className="text-[11px] text-emerald-100/70">
                    {u.name || 'No name'} · {u.role}
                  </div>
                </div>
                <div className="text-[11px] text-emerald-100/60">
                  {new Date(u.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
}

