import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, Plus, Send, Users, User } from 'lucide-react';
import { Card, Button, Input, Modal, Textarea, Select, Badge } from '../components/ui';
import { useAuth } from '../auth';
import { apiRequest } from '../lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  targetType: string;
  createdAt: string;
}

interface UserGroup {
  id: string;
  name: string;
}

export function NotificationsPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    targetType: 'all',
    groupId: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const [notifications, groups] = await Promise.all([
        apiRequest<{ notifications: Notification[] }>('/api/admin-notifications', {}, accessToken),
        apiRequest<{ groups: UserGroup[] }>('/api/admin-groups', {}, accessToken).catch(() => ({ groups: [] })),
      ]);
      return { notifications: notifications.notifications, groups: groups.groups };
    },
    enabled: !!accessToken,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/admin-notifications', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          groupId: data.targetType === 'group' ? data.groupId : undefined,
        }),
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      targetType: 'all',
      groupId: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const typeColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'danger',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A3D35]">Notifications</h1>
          <p className="text-sm text-gray-600 mt-1">Send notifications to users</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Send Notification
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-gray-500">Loading notifications...</div>
        </Card>
      ) : (
        <div className="space-y-4">
          {data?.notifications?.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#0A3D35]">{notification.title}</h3>
                      <Badge variant={typeColors[notification.type] || 'default'}>
                        {notification.type}
                      </Badge>
                      <Badge variant="info">
                        {notification.targetType}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      Sent {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Send Notification"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Textarea
            label="Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={4}
            required
          />
          <Select
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { value: 'info', label: 'Info' },
              { value: 'success', label: 'Success' },
              { value: 'warning', label: 'Warning' },
              { value: 'error', label: 'Error' },
            ]}
            required
          />
          <Select
            label="Target Audience"
            value={formData.targetType}
            onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
            options={[
              { value: 'all', label: 'All Users' },
              { value: 'group', label: 'User Group' },
              { value: 'individual', label: 'Individual User' },
            ]}
            required
          />
          {formData.targetType === 'group' && (
            <Select
              label="User Group"
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              options={[
                { value: '', label: 'Select a group' },
                ...(data?.groups?.map((group) => ({
                  value: group.id,
                  label: group.name,
                })) || []),
              ]}
              required
            />
          )}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              isLoading={createMutation.isPending}
              className="flex-1"
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send Notification
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
