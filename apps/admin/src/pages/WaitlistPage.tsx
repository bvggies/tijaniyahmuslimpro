import { useQuery } from '@tanstack/react-query';
import { Card } from '@tmp/ui';
import { useAuth } from '../auth';

interface SubscriberDto {
  id: string;
  email: string;
  createdAt: string;
}

interface ContactDto {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3000';

export function WaitlistPage() {
  const { accessToken } = useAuth();

  const { data } = useQuery({
    queryKey: ['adminWaitlist'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-waitlist`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load waitlist');
      return (await res.json()) as { subscribers: SubscriberDto[]; contacts: ContactDto[] };
    },
    enabled: !!accessToken,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-emerald-50">Waitlist & contacts</h1>
      <Card className="px-4 py-3 text-xs space-y-2">
        <div className="text-emerald-100/80 mb-1">Subscribers</div>
        {data?.subscribers?.length ? (
          data.subscribers.map(s => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-black/40 px-3 py-2"
            >
              <span className="text-emerald-50">{s.email}</span>
              <span className="text-[11px] text-emerald-100/70">
                {new Date(s.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-[11px] text-emerald-100/70">No subscribers yet.</div>
        )}
      </Card>
      <Card className="px-4 py-3 text-xs space-y-2">
        <div className="text-emerald-100/80 mb-1">Contact submissions</div>
        {data?.contacts?.length ? (
          data.contacts.map(c => (
            <div
              key={c.id}
              className="rounded-xl border border-emerald-400/20 bg-black/40 px-3 py-2"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-emerald-50">{c.name}</span>
                <span className="text-[11px] text-emerald-100/70">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-[11px] text-emerald-100/80 mb-1">{c.email}</div>
              <div className="text-[11px] text-emerald-100/80">{c.message}</div>
            </div>
          ))
        ) : (
          <div className="text-[11px] text-emerald-100/70">No contact messages yet.</div>
        )}
      </Card>
    </div>
  );
}

