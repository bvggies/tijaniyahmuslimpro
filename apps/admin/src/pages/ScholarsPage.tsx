import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button } from '@tmp/ui';
import { useAuth } from '../auth';
import { FormEvent, useState } from 'react';

interface ScholarContentDto {
  id: string;
  title: string;
  body: string;
  mediaUrl?: string | null;
  backgroundColor?: string | null;
  displayOrder: number;
  createdAt: string;
}

interface ScholarDto {
  id: string;
  name: string;
  bio: string;
  avatarUrl?: string | null;
  contents?: ScholarContentDto[];
  createdAt: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3000';

export function ScholarsPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ScholarDto | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedScholar, setSelectedScholar] = useState<ScholarDto | null>(null);
  const [contentOpen, setContentOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ScholarContentDto | null>(null);
  const [contentTitle, setContentTitle] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [contentMediaUrl, setContentMediaUrl] = useState('');
  const [contentBgColor, setContentBgColor] = useState('#105056');

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

  const createMutation = useMutation({
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

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const res = await fetch(`${API_BASE_URL}/api/admin-scholars`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: editing.id,
          name,
          bio,
          avatarUrl: avatarUrl || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to update scholar');
      return res.json();
    },
    onSuccess: () => {
      setName('');
      setBio('');
      setAvatarUrl('');
      setEditing(null);
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['adminScholars'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/admin-scholars`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete scholar');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adminScholars'] });
    },
  });

  const createContentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedScholar) return;
      const res = await fetch(`${API_BASE_URL}/api/admin-scholar-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          scholarId: selectedScholar.id,
          title: contentTitle,
          body: contentBody,
          mediaUrl: contentMediaUrl || null,
          backgroundColor: contentBgColor,
        }),
      });
      if (!res.ok) throw new Error('Failed to create section card');
      return res.json();
    },
    onSuccess: () => {
      setContentTitle('');
      setContentBody('');
      setContentMediaUrl('');
      setContentBgColor('#105056');
      setContentOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['adminScholars'] });
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async () => {
      if (!editingContent) return;
      const res = await fetch(`${API_BASE_URL}/api/admin-scholar-content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: editingContent.id,
          title: contentTitle,
          body: contentBody,
          mediaUrl: contentMediaUrl || null,
          backgroundColor: contentBgColor,
        }),
      });
      if (!res.ok) throw new Error('Failed to update section card');
      return res.json();
    },
    onSuccess: () => {
      setContentTitle('');
      setContentBody('');
      setContentMediaUrl('');
      setContentBgColor('#105056');
      setEditingContent(null);
      setContentOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['adminScholars'] });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/admin-scholar-content`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete section card');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adminScholars'] });
    },
  });

  const handleEdit = (scholar: ScholarDto) => {
    setEditing(scholar);
    setName(scholar.name);
    setBio(scholar.bio);
    setAvatarUrl(scholar.avatarUrl || '');
    setOpen(true);
  };

  const handleCancel = () => {
    setEditing(null);
    setName('');
    setBio('');
    setAvatarUrl('');
    setOpen(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleAddContent = (scholar: ScholarDto) => {
    setSelectedScholar(scholar);
    setEditingContent(null);
    setContentTitle('');
    setContentBody('');
    setContentMediaUrl('');
    setContentBgColor('#105056');
    setContentOpen(true);
  };

  const handleEditContent = (content: ScholarContentDto, scholar: ScholarDto) => {
    setSelectedScholar(scholar);
    setEditingContent(content);
    setContentTitle(content.title);
    setContentBody(content.body);
    setContentMediaUrl(content.mediaUrl || '');
    setContentBgColor(content.backgroundColor || '#105056');
    setContentOpen(true);
  };

  const handleCancelContent = () => {
    setSelectedScholar(null);
    setEditingContent(null);
    setContentTitle('');
    setContentBody('');
    setContentMediaUrl('');
    setContentBgColor('#105056');
    setContentOpen(false);
  };

  const handleSubmitContent = (e: FormEvent) => {
    e.preventDefault();
    if (editingContent) {
      updateContentMutation.mutate();
    } else {
      createContentMutation.mutate();
    }
  };

  const predefinedColors = [
    { name: 'Dark Teal', value: '#105056' },
    { name: 'Teal 700', value: '#187881' },
    { name: 'Teal 600', value: '#21a0ab' },
    { name: 'Teal 500', value: '#29c8d6' },
    { name: 'Evergreen', value: '#08f774' },
    { name: 'Pine Blue', value: '#94d1cb' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-emerald-50">Scholars</h1>
        <Button onClick={() => setOpen(true)} disabled={open}>
          Add Scholar
        </Button>
      </div>

      {open && (
        <Card className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-emerald-50">
              {editing ? 'Edit Scholar' : 'Add New Scholar'}
            </h2>
            <button
              onClick={handleCancel}
              className="text-xs text-emerald-100/70 hover:text-emerald-50"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2 text-xs">
            <div className="space-y-1">
              <label className="text-emerald-100/80">Name *</label>
              <input
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">Avatar URL (optional)</label>
              <input
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                type="url"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-emerald-100/80">Bio *</label>
              <textarea
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50 min-h-[120px]"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving…'
                  : editing
                    ? 'Update Scholar'
                    : 'Save Scholar'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {contentOpen && selectedScholar && (
        <Card className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-emerald-50">
              {editingContent ? 'Edit Section Card' : 'Add Section Card'} - {selectedScholar.name}
            </h2>
            <button
              onClick={handleCancelContent}
              className="text-xs text-emerald-100/70 hover:text-emerald-50"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleSubmitContent} className="grid gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-emerald-100/80">Title *</label>
              <input
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">Body *</label>
              <textarea
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50 min-h-[120px]"
                value={contentBody}
                onChange={(e) => setContentBody(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">Media URL (optional)</label>
              <input
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={contentMediaUrl}
                onChange={(e) => setContentMediaUrl(e.target.value)}
                type="url"
              />
            </div>
            <div className="space-y-2">
              <label className="text-emerald-100/80">Background Color *</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setContentBgColor(color.value)}
                    className={`rounded-lg border-2 p-2 text-[10px] ${
                      contentBgColor === color.value
                        ? 'border-emerald-400'
                        : 'border-emerald-400/30'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    <div className="text-white font-semibold">{color.name}</div>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={contentBgColor}
                  onChange={(e) => setContentBgColor(e.target.value)}
                  className="h-8 w-16 rounded border border-emerald-400/30"
                />
                <input
                  type="text"
                  value={contentBgColor}
                  onChange={(e) => setContentBgColor(e.target.value)}
                  pattern="^#[0-9A-Fa-f]{6}$"
                  className="flex-1 rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50 text-xs"
                  placeholder="#105056"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={handleCancelContent}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createContentMutation.isPending || updateContentMutation.isPending}
              >
                {createContentMutation.isPending || updateContentMutation.isPending
                  ? 'Saving…'
                  : editingContent
                    ? 'Update Card'
                    : 'Save Card'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="px-4 py-3 text-xs space-y-2">
        <div className="text-emerald-100/80 mb-1 font-semibold">
          Existing Scholars ({data?.scholars?.length || 0})
        </div>
        {data?.scholars?.length ? (
          data.scholars.map((s) => (
            <div key={s.id} className="space-y-3">
              <div className="flex items-start justify-between rounded-xl border border-emerald-400/20 bg-black/40 px-3 py-2">
                <div className="flex-1">
                  <div className="font-semibold text-emerald-50 mb-1">{s.name}</div>
                  <div className="text-[11px] text-emerald-100/70 mb-1 line-clamp-2">{s.bio}</div>
                  <div className="text-[11px] text-emerald-100/60">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2 ml-3">
                  <button
                    onClick={() => handleEdit(s)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleAddContent(s)}
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    Add Card
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete scholar ${s.name}?`)) {
                        deleteMutation.mutate(s.id);
                      }
                    }}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Section Cards */}
              {s.contents && s.contents.length > 0 && (
                <div className="ml-4 space-y-2">
                  <div className="text-[10px] text-emerald-100/60 font-semibold">
                    Section Cards ({s.contents.length})
                  </div>
                  {s.contents.map((content) => (
                    <div
                      key={content.id}
                      className="rounded-lg border border-emerald-400/20 p-3"
                      style={{ backgroundColor: content.backgroundColor || '#105056' }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-white text-xs mb-1">
                            {content.title}
                          </div>
                          <div className="text-[10px] text-white/80 line-clamp-2">
                            {content.body}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => handleEditContent(content, s)}
                            className="text-[10px] text-white/80 hover:text-white underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete section card "${content.title}"?`)) {
                                deleteContentMutation.mutate(content.id);
                              }
                            }}
                            className="text-[10px] text-red-300 hover:text-red-200 underline"
                            disabled={deleteContentMutation.isPending}
                          >
                            Del
                          </button>
                        </div>
                      </div>
                      {content.mediaUrl && (
                        <div className="text-[9px] text-white/60 mt-1">
                          Media: {content.mediaUrl.substring(0, 40)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-[11px] text-emerald-100/70">No scholars yet.</div>
        )}
      </Card>
    </div>
  );
}
