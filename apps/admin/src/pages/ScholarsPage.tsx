import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button } from '@tmp/ui';
import { useAuth } from '../auth';
import { FormEvent, useState } from 'react';

interface ScholarDto {
  id: string;
  name: string;
  bio: string;
  avatarUrl?: string | null;
  createdAt: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3000';

export function ScholarsPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const { data } = useQuery({
    queryKey: ['adminScholars'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-scholars`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load scholars');
      return (await res.json()) as { scholars: ScholarDto[] };
    },
    enabled: !!accessToken,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-scholars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          bio,
          avatarUrl: avatarUrl || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to create scholar');
      return res.json();
    },
    onSuccess: () => {
      setName('');
      setBio('');
      setAvatarUrl('');
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['adminScholars'] });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-emerald-50">Scholars</h1>
        <Button onClick={() => setOpen(o => !o)}>{open ? 'Close form' : 'Add scholar'}</Button>
      </div>
      {open && (
        <Card className="px-4 py-3">
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2 text-xs">
            <div className="space-y-1">
              <label className="text-emerald-100/80">Name</label>
              <input
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">Avatar URL (optional)</label>
              <input
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-emerald-100/80">Bio</label>
              <textarea
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={bio}
                onChange={e => setBio(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving…' : 'Save scholar'}
              </Button>
            </div>
          </form>
        </Card>
      )}
      <Card className="px-4 py-3 text-xs space-y-2">
        <div className="text-emerald-100/80 mb-1">Existing scholars</div>
        {data?.scholars?.length ? (
          data.scholars.map(s => (
            <div
              key={s.id}
              className="flex items-start justify-between rounded-xl border border-emerald-400/20 bg-black/40 px-3 py-2"
            >
              <div>
                <div className="font-semibold text-emerald-50 mb-1">{s.name}</div>
                <div className="text-[11px] text-emerald-100/70 mb-1 line-clamp-2">{s.bio}</div>
                <div className="text-[11px] text-emerald-100/60">
                  {new Date(s.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-[11px] text-emerald-100/70">No scholars yet.</div>
        )}
      </Card>
    </div>
  );
}

