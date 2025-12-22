import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button } from '@tmp/ui';
import { useAuth } from '../auth';
import { FormEvent, useState } from 'react';

interface MakkahStreamDto {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3000';

export function MakkahStreamsPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MakkahStreamDto | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [url, setUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const { data } = useQuery({
    queryKey: ['adminMakkahStreams'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-makkah-streams`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load streams');
      return (await res.json()) as { streams: MakkahStreamDto[] };
    },
    enabled: !!accessToken,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-makkah-streams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title,
          subtitle,
          url,
          displayOrder: Number(displayOrder),
          isActive,
        }),
      });
      if (!res.ok) throw new Error('Failed to create stream');
      return res.json();
    },
    onSuccess: () => {
      resetForm();
      void queryClient.invalidateQueries({ queryKey: ['adminMakkahStreams'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-makkah-streams`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: editing!.id,
          title,
          subtitle,
          url,
          displayOrder: Number(displayOrder),
          isActive,
        }),
      });
      if (!res.ok) throw new Error('Failed to update stream');
      return res.json();
    },
    onSuccess: () => {
      resetForm();
      void queryClient.invalidateQueries({ queryKey: ['adminMakkahStreams'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/admin-makkah-streams`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete stream');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adminMakkahStreams'] });
    },
  });

  const resetForm = () => {
    setOpen(false);
    setEditing(null);
    setTitle('');
    setSubtitle('');
    setUrl('');
    setDisplayOrder(0);
    setIsActive(true);
  };

  const handleEdit = (stream: MakkahStreamDto) => {
    setEditing(stream);
    setTitle(stream.title);
    setSubtitle(stream.subtitle);
    setUrl(stream.url);
    setDisplayOrder(stream.displayOrder);
    setIsActive(stream.isActive);
    setOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-emerald-50">Makkah Live Streams</h1>
        <Button onClick={() => setOpen(true)} disabled={open}>
          Add Stream
        </Button>
      </div>

      {open && (
        <Card className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-emerald-50">
              {editing ? 'Edit Stream' : 'Add Stream'}
            </h2>
            <button
              onClick={resetForm}
              className="text-xs text-emerald-100/70 hover:text-emerald-50"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-emerald-100/80">Title</label>
              <input
                type="text"
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50 text-[11px]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., Makkah Live Online 24/7"
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">Subtitle</label>
              <input
                type="text"
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50 text-[11px]"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                required
                placeholder="e.g., Live streaming from the Holy Kaaba"
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">YouTube URL</label>
              <input
                type="url"
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50 text-[11px]"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                placeholder="https://www.youtube.com/embed/VIDEO_ID"
              />
              <p className="text-[10px] text-emerald-100/60 mt-1">
                Use YouTube embed URL format: https://www.youtube.com/embed/VIDEO_ID
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">Display Order</label>
              <input
                type="number"
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50 text-[11px]"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                min="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-emerald-400/30"
              />
              <label htmlFor="isActive" className="text-emerald-100/80">
                Active
              </label>
            </div>
            <Button
              type="submit"
              variant="primary"
              className="text-[11px] px-3 py-1"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? 'Update Stream' : 'Create Stream'}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-2">
        {data?.streams.map((stream) => (
          <Card key={stream.id} className="px-4 py-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-emerald-50">{stream.title}</h3>
                  {!stream.isActive && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-100/70 mb-2">{stream.subtitle}</p>
                <p className="text-[11px] text-emerald-100/60 font-mono break-all">
                  {stream.url}
                </p>
                <p className="text-[10px] text-emerald-100/50 mt-1">
                  Order: {stream.displayOrder}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(stream)}
                  className="text-xs text-emerald-100/80 hover:text-emerald-50 underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this stream?')) {
                      deleteMutation.mutate(stream.id);
                    }
                  }}
                  className="text-xs text-red-300/80 hover:text-red-300 underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </Card>
        ))}
        {data?.streams.length === 0 && (
          <Card className="px-4 py-3 text-center">
            <p className="text-sm text-emerald-100/70">No streams yet. Add one to get started.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

