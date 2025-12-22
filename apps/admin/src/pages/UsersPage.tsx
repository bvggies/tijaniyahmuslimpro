import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button } from '@tmp/ui';
import { useAuth } from '../auth';
import { FormEvent, useState } from 'react';

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3000';
const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CONTENT_MANAGER', 'USER'];

export function UsersPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('USER');

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

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email, name, password, roleName }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create user');
      }
      return res.json();
    },
    onSuccess: () => {
      setEmail('');
      setName('');
      setPassword('');
      setRoleName('USER');
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const res = await fetch(`${API_BASE_URL}/api/admin-users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: editing.id,
          email,
          name,
          roleName,
          ...(password ? { password } : {}),
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update user');
      }
      return res.json();
    },
    onSuccess: () => {
      setEmail('');
      setName('');
      setPassword('');
      setRoleName('USER');
      setEditing(null);
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/admin-users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete user');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const handleEdit = (user: UserRow) => {
    setEditing(user);
    setEmail(user.email);
    setName(user.name || '');
    setPassword('');
    setRoleName(user.role);
    setOpen(true);
  };

  const handleCancel = () => {
    setEditing(null);
    setEmail('');
    setName('');
    setPassword('');
    setRoleName('USER');
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-emerald-50">User Management</h1>
        <Button onClick={() => setOpen(true)} disabled={open}>
          Add User
        </Button>
      </div>

      {open && (
        <Card className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-emerald-50">
              {editing ? 'Edit User' : 'Add New User'}
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
              <label className="text-emerald-100/80">Email *</label>
              <input
                type="email"
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">Name</label>
              <input
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">
                Password {editing ? '(leave empty to keep current)' : '*'}
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!editing}
                minLength={8}
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">Role *</label>
              <select
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
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
                    ? 'Update User'
                    : 'Create User'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="px-4 py-3 text-xs">
        <div className="text-emerald-100/80 mb-3 font-semibold">
          Users ({data?.users?.length || 0})
        </div>
        {isLoading && <div className="text-emerald-100/70">Loading users…</div>}
        {!isLoading && !data?.users?.length && (
          <div className="text-emerald-100/70">No users yet.</div>
        )}
        {data?.users?.length ? (
          <div className="space-y-2">
            {data.users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-black/40 px-3 py-2"
              >
                <div className="flex-1">
                  <div className="text-emerald-50 font-semibold">{u.email}</div>
                  <div className="text-[11px] text-emerald-100/70">
                    {u.name || 'No name'} · {u.role}
                  </div>
                  <div className="text-[11px] text-emerald-100/60">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(u)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete user ${u.email}?`)) {
                        deleteMutation.mutate(u.id);
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
        ) : null}
      </Card>
    </div>
  );
}
