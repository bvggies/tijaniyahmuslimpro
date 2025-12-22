import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button } from '@tmp/ui';
import { useAuth } from '../auth';
import { FormEvent, useState } from 'react';

interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetType: 'all' | 'group' | 'individual';
  targetUsers: Array<{
    id: string;
    user: {
      id: string;
      email: string;
      name: string | null;
    };
    isRead: boolean;
  }>;
  createdAt: string;
}

interface UserGroupDto {
  id: string;
  name: string;
  description: string | null;
  users: Array<{
    user: {
      id: string;
      email: string;
      name: string | null;
    };
  }>;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3000';

export function NotificationsPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'error'>('info');
  const [targetType, setTargetType] = useState<'all' | 'group' | 'individual'>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const { data: notificationsData } = useQuery({
    queryKey: ['adminNotifications'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-notifications`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load notifications');
      return (await res.json()) as { notifications: NotificationDto[] };
    },
    enabled: !!accessToken,
  });

  const { data: usersData } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load users');
      return (await res.json()) as { users: Array<{ id: string; email: string; name: string | null }> };
    },
    enabled: !!accessToken && (targetType === 'individual' || open),
  });

  const { data: groupsData } = useQuery({
    queryKey: ['adminGroups'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-groups`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load groups');
      return (await res.json()) as { groups: UserGroupDto[] };
    },
    enabled: !!accessToken && (targetType === 'group' || open),
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title,
          message,
          type,
          targetType,
          ...(targetType === 'individual' ? { targetUserIds: selectedUserIds } : {}),
          ...(targetType === 'group' ? { targetGroupId: selectedGroupId } : {}),
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to send notification');
      }
      return res.json();
    },
    onSuccess: () => {
      setTitle('');
      setMessage('');
      setType('info');
      setTargetType('all');
      setSelectedUserIds([]);
      setSelectedGroupId('');
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
      alert('Notification sent successfully!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/admin-notifications`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete notification');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (targetType === 'individual' && selectedUserIds.length === 0) {
      alert('Please select at least one user');
      return;
    }
    if (targetType === 'group' && !selectedGroupId) {
      alert('Please select a group');
      return;
    }
    sendMutation.mutate();
  };

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-emerald-50">Notifications</h1>
        <Button onClick={() => setOpen(true)} disabled={open}>
          Send Notification
        </Button>
      </div>

      {open && (
        <Card className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-emerald-50">Send Notification</h2>
            <button
              onClick={() => {
                setOpen(false);
                setTitle('');
                setMessage('');
                setType('info');
                setTargetType('all');
                setSelectedUserIds([]);
                setSelectedGroupId('');
              }}
              className="text-xs text-emerald-100/70 hover:text-emerald-50"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-emerald-100/80">Title *</label>
              <input
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">Message *</label>
              <textarea
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50 min-h-[100px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                maxLength={2000}
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">Type *</label>
              <select
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                required
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/80">Send To *</label>
              <select
                className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value as typeof targetType);
                  setSelectedUserIds([]);
                  setSelectedGroupId('');
                }}
                required
              >
                <option value="all">All Users</option>
                <option value="group">User Group</option>
                <option value="individual">Individual Users</option>
              </select>
            </div>

            {targetType === 'group' && (
              <div className="space-y-1">
                <label className="text-emerald-100/80">Select Group *</label>
                <select
                  className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  required
                >
                  <option value="">-- Select Group --</option>
                  {groupsData?.groups?.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.users.length} users)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetType === 'individual' && (
              <div className="space-y-1">
                <label className="text-emerald-100/80">Select Users *</label>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-emerald-400/30 bg-black/40 p-2 space-y-1">
                  {usersData?.users?.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-emerald-400/10 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => toggleUser(user.id)}
                        className="rounded border-emerald-400/30"
                      />
                      <span className="text-emerald-50 text-[11px]">
                        {user.email} {user.name && `(${user.name})`}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="text-[11px] text-emerald-100/70">
                  {selectedUserIds.length} user(s) selected
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setOpen(false);
                  setTitle('');
                  setMessage('');
                  setType('info');
                  setTargetType('all');
                  setSelectedUserIds([]);
                  setSelectedGroupId('');
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={sendMutation.isPending}>
                {sendMutation.isPending ? 'Sending…' : 'Send Notification'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="px-4 py-3 text-xs">
        <div className="text-emerald-100/80 mb-3 font-semibold">
          Sent Notifications ({notificationsData?.notifications?.length || 0})
        </div>
        {notificationsData?.notifications?.length ? (
          <div className="space-y-2">
            {notificationsData.notifications.map((notif) => (
              <div
                key={notif.id}
                className="rounded-xl border border-emerald-400/20 bg-black/40 px-3 py-2"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-emerald-50">{notif.title}</div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded ${
                        notif.type === 'info'
                          ? 'bg-blue-500/20 text-blue-300'
                          : notif.type === 'success'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : notif.type === 'warning'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {notif.type}
                    </span>
                    <span className="text-[10px] text-emerald-100/60">
                      {notif.targetType === 'all'
                        ? 'All Users'
                        : notif.targetType === 'group'
                          ? 'Group'
                          : `${notif.targetUsers.length} Users`}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this notification?')) {
                        deleteMutation.mutate(notif.id);
                      }
                    }}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </button>
                </div>
                <div className="text-[11px] text-emerald-100/70 mb-1">{notif.message}</div>
                <div className="text-[11px] text-emerald-100/60">
                  {new Date(notif.createdAt).toLocaleString()} ·{' '}
                  {notif.targetUsers.filter((tu) => tu.isRead).length} / {notif.targetUsers.length}{' '}
                  read
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-emerald-100/70">No notifications sent yet.</div>
        )}
      </Card>
    </div>
  );
}

