import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button } from '@tmp/ui';
import { useAuth } from '../auth';
import { FormEvent, useState } from 'react';

interface ReleaseNoteDto {
  id: string;
  version: string;
  title: string;
  body: string;
  createdAt: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3000';

export function ReleaseNotesPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [version, setVersion] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const { data } = useQuery({
    queryKey: ['adminReleaseNotes'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-release-notes`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load release notes');
      return (await res.json()) as { notes: ReleaseNoteDto[] };
    },
    enabled: !!accessToken,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-release-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ version, title, body }),
      });
      if (!res.ok) throw new Error('Failed to create note');
      return res.json();
    },
    onSuccess: () => {
      setVersion('');
      setTitle('');
      setBody('');
      void queryClient.invalidateQueries({ queryKey: ['adminReleaseNotes'] });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-emerald-50">Release notes</h1>
      <Card className="px-4 py-3 text-xs space-y-2">
        <div className="flex items-center justify-between mb-1">
          <div className="text-emerald-100/80">Create a new entry</div>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-2 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-emerald-100/80">Version</label>
            <input
              className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
              value={version}
              onChange={e => setVersion(e.target.value)}
              placeholder="1.0.0"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-emerald-100/80">Title</label>
            <input
              className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-emerald-100/80">Body</label>
            <textarea
              className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
              value={body}
              onChange={e => setBody(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save release note'}
            </Button>
          </div>
        </form>
      </Card>
      <Card className="px-4 py-3 text-xs space-y-2">
        <div className="text-emerald-100/80 mb-1">History</div>
        {data?.notes?.length ? (
          data.notes.map(n => (
            <div
              key={n.id}
              className="rounded-xl border border-emerald-400/20 bg-black/40 px-3 py-2"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-emerald-50 font-semibold">
                  v{n.version} – {n.title}
                </span>
                <span className="text-[11px] text-emerald-100/70">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80 whitespace-pre-line">{n.body}</p>
            </div>
          ))
        ) : (
          <div className="text-[11px] text-emerald-100/70">No release notes yet.</div>
        )}
      </Card>
    </div>
  );
}

