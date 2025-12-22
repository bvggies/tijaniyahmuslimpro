import { FormEvent, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button } from '@tmp/ui';
import { useAuth } from '../auth';

interface Dua {
  id: string;
  title: string;
  arabic: string;
  translation: string;
  reference?: string;
  category?: { name: string };
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3000';

export function DuasPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [arabic, setArabic] = useState('');
  const [translation, setTranslation] = useState('');
  const [categoryName, setCategoryName] = useState('');

  const { data } = useQuery({
    queryKey: ['adminDuas'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-duas`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load duas');
      return (await res.json()) as { duas: Dua[] };
    },
    enabled: !!accessToken,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-duas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title,
          arabic,
          translation,
          categoryName: categoryName || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to create dua');
      return res.json();
    },
    onSuccess: () => {
      setTitle('');
      setArabic('');
      setTranslation('');
      setCategoryName('');
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['adminDuas'] });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-emerald-50">Duas</h1>
        <Button onClick={() => setOpen(o => !o)}>{open ? 'Close form' : 'Add dua'}</Button>
      </div>
      {open && (
        <Card className="px-4 py-3">
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2 text-xs">
            <div className="space-y-1">
              <label className="text-emerald-100/80">Title</label>
              <input
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">Category</label>
              <input
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-emerald-100/80">Arabic</label>
              <textarea
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={arabic}
                onChange={e => setArabic(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-emerald-100/80">Translation</label>
              <textarea
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={translation}
                onChange={e => setTranslation(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving…' : 'Save dua'}
              </Button>
            </div>
          </form>
        </Card>
      )}
      <Card className="px-4 py-3 text-xs space-y-2">
        {data?.duas?.length ? (
          data.duas.map(dua => (
            <div key={dua.id} className="rounded-xl border border-emerald-400/20 bg-black/40 px-3 py-2">
              <div className="flex justify-between items-center mb-1">
                <div className="font-semibold text-emerald-50">{dua.title}</div>
                {dua.category && <div className="text-[10px] text-emerald-100/70">{dua.category.name}</div>}
              </div>
              <div className="text-emerald-100/80 mb-1">{dua.arabic}</div>
              <div className="text-emerald-100/70">{dua.translation}</div>
            </div>
          ))
        ) : (
          <div className="text-emerald-100/70">No duas created yet.</div>
        )}
      </Card>
    </div>
  );
}


