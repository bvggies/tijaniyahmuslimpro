import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button } from '@tmp/ui';
import { useAuth } from '../auth';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3000';

export function SupportTicketsPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['adminSupportTickets'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-support-tickets`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load tickets');
      return (await res.json()) as { tickets: SupportTicket[] };
    },
    enabled: !!accessToken,
  });

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/admin-support-tickets`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id, status: 'closed' }),
      });
      if (!res.ok) throw new Error('Failed to update ticket');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adminSupportTickets'] });
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-emerald-50">Support tickets</h1>
      <Card className="px-4 py-3 space-y-3">
        <p className="text-xs text-emerald-100/80">
          Review and resolve tickets created from the mobile app and website contact forms.
        </p>
        <div className="space-y-2 text-xs">
          {data?.tickets?.length ? (
            data.tickets.map(ticket => (
              <div
                key={ticket.id}
                className="flex items-start justify-between rounded-xl border border-emerald-400/20 bg-black/40 px-3 py-2"
              >
                <div>
                  <div className="font-semibold text-emerald-50 mb-1">{ticket.subject}</div>
                  <div className="text-emerald-100/80 mb-1">{ticket.message}</div>
                  <div className="text-[11px] text-emerald-100/70">
                    {ticket.status} · {new Date(ticket.createdAt).toLocaleString()}
                  </div>
                </div>
                {ticket.status === 'open' && (
                  <Button
                    variant="secondary"
                    className="text-[11px] px-3 py-1"
                    onClick={() => mutation.mutate(ticket.id)}
                    disabled={mutation.isPending}
                  >
                    Mark resolved
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className="text-[11px] text-emerald-100/70">No tickets yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
}



