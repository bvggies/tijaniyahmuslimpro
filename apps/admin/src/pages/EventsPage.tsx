import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button } from '@tmp/ui';
import { useAuth } from '../auth';
import { FormEvent, useState } from 'react';

interface EventDto {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3000';

export function EventsPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EventDto | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const { data } = useQuery({
    queryKey: ['adminEvents'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-events`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load events');
      return (await res.json()) as { events: EventDto[] };
    },
    enabled: !!accessToken,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title,
          description,
          startDate: new Date(startDate).toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : null,
          location: location || null,
          imageUrl: imageUrl || null,
          isActive,
        }),
      });
      if (!res.ok) throw new Error('Failed to create event');
      return res.json();
    },
    onSuccess: () => {
      resetForm();
      void queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const res = await fetch(`${API_BASE_URL}/api/admin-events`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: editing.id,
          title,
          description,
          startDate: new Date(startDate).toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : null,
          location: location || null,
          imageUrl: imageUrl || null,
          isActive,
        }),
      });
      if (!res.ok) throw new Error('Failed to update event');
      return res.json();
    },
    onSuccess: () => {
      resetForm();
      void queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/admin-events`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete event');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
    },
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setLocation('');
    setImageUrl('');
    setIsActive(true);
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (event: EventDto) => {
    setEditing(event);
    setTitle(event.title);
    setDescription(event.description);
    setStartDate(new Date(event.startDate).toISOString().slice(0, 16));
    setEndDate(event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '');
    setLocation(event.location || '');
    setImageUrl(event.imageUrl || '');
    setIsActive(event.isActive);
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
        <h1 className="text-lg font-semibold text-emerald-50">Events Management</h1>
        <Button onClick={() => setOpen(true)} disabled={open}>
          Add Event
        </Button>
      </div>

      {open && (
        <Card className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-emerald-50">
              {editing ? 'Edit Event' : 'Add New Event'}
            </h2>
            <button
              onClick={resetForm}
              className="text-xs text-emerald-100/70 hover:text-emerald-50"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2 text-xs">
            <div className="space-y-1 md:col-span-2">
              <label className="text-emerald-100/80">Title *</label>
              <input
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-emerald-100/80">Description *</label>
              <textarea
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50 min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">Start Date *</label>
              <input
                type="datetime-local"
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">End Date (optional)</label>
              <input
                type="datetime-local"
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">Location</label>
              <input
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">Image URL</label>
              <input
                type="url"
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="flex items-center gap-2 text-emerald-100/80">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-emerald-400/30"
                />
                Active (visible to users)
              </label>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving…'
                  : editing
                    ? 'Update Event'
                    : 'Create Event'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="px-4 py-3 text-xs">
        <div className="text-emerald-100/80 mb-3 font-semibold">
          Events ({data?.events?.length || 0})
        </div>
        {data?.events?.length ? (
          <div className="space-y-2">
            {data.events.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between rounded-xl border border-emerald-400/20 bg-black/40 px-3 py-2"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-semibold text-emerald-50">{event.title}</div>
                    {event.isActive ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-500/20 text-gray-300">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-emerald-100/70 mb-1 line-clamp-2">
                    {event.description}
                  </div>
                  <div className="text-[11px] text-emerald-100/60">
                    {new Date(event.startDate).toLocaleString()} · {event.location || 'No location'}
                  </div>
                </div>
                <div className="flex gap-2 ml-3">
                  <button
                    onClick={() => handleEdit(event)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete event "${event.title}"?`)) {
                        deleteMutation.mutate(event.id);
                      }
                    }}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-emerald-100/70">No events yet.</div>
        )}
      </Card>
    </div>
  );
}

