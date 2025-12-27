import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Video, Plus, Edit, Trash2, Play } from 'lucide-react';
import { Card, Button, Input, Modal, Badge } from '../components/ui';
import { useAuth } from '../auth';
import { apiRequest } from '../lib/api';

interface Stream {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export function MakkahStreamsPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    url: '',
    displayOrder: 0,
    isActive: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-makkah-streams'],
    queryFn: async () => {
      return apiRequest<{ streams: Stream[] }>('/api/admin-makkah-streams', {}, accessToken);
    },
    enabled: !!accessToken,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/admin-makkah-streams', {
        method: 'POST',
        body: JSON.stringify(data),
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-makkah-streams'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      return apiRequest(`/api/admin-makkah-streams?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-makkah-streams'] });
      setIsModalOpen(false);
      setEditingStream(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin-makkah-streams?id=${id}`, {
        method: 'DELETE',
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-makkah-streams'] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      url: '',
      displayOrder: 0,
      isActive: true,
    });
    setEditingStream(null);
  };

  const handleEdit = (stream: Stream) => {
    setEditingStream(stream);
    setFormData({
      title: stream.title,
      subtitle: stream.subtitle,
      url: stream.url,
      displayOrder: stream.displayOrder,
      isActive: stream.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStream) {
      updateMutation.mutate({ id: editingStream.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A3D35]">Makkah Streams</h1>
          <p className="text-sm text-gray-600 mt-1">Manage live Makkah stream channels</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Stream
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-gray-500">Loading streams...</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.streams?.map((stream) => (
            <motion.div
              key={stream.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <div className="aspect-video bg-gradient-to-br from-[#0A3D35] to-[#18F59B] rounded-xl mb-4 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" />
                </div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#0A3D35] mb-1">{stream.title}</h3>
                    <p className="text-sm text-gray-600">{stream.subtitle}</p>
                  </div>
                  <Badge variant={stream.isActive ? 'success' : 'default'}>
                    {stream.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 mb-4">Order: {stream.displayOrder}</div>
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(stream)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this stream?')) {
                        deleteMutation.mutate(stream.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
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
        title={editingStream ? 'Edit Stream' : 'Add New Stream'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            label="Subtitle"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            required
          />
          <Input
            label="Stream URL"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            required
          />
          <Input
            label="Display Order"
            type="number"
            value={formData.displayOrder}
            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-[#18F59B] focus:ring-[#18F59B]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Stream is active
            </label>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {editingStream ? 'Update Stream' : 'Create Stream'}
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
