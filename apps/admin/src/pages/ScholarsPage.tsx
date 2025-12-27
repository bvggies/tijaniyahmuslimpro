import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { GraduationCap, Plus, Edit, Trash2, FileText } from 'lucide-react';
import { Card, Button, Input, Modal, Badge, Textarea } from '../components/ui';
import { useAuth } from '../auth';
import { apiRequest } from '../lib/api';

interface Scholar {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  createdAt: string;
}

export function ScholarsPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScholar, setEditingScholar] = useState<Scholar | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatarUrl: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-scholars'],
    queryFn: async () => {
      return apiRequest<{ scholars: Scholar[] }>('/api/admin-scholars', {}, accessToken);
    },
    enabled: !!accessToken,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/admin-scholars', {
        method: 'POST',
        body: JSON.stringify(data),
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scholars'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      return apiRequest(`/api/admin-scholars?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scholars'] });
      setIsModalOpen(false);
      setEditingScholar(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin-scholars?id=${id}`, {
        method: 'DELETE',
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scholars'] });
    },
  });

  const resetForm = () => {
    setFormData({ name: '', bio: '', avatarUrl: '' });
    setEditingScholar(null);
  };

  const handleEdit = (scholar: Scholar) => {
    setEditingScholar(scholar);
    setFormData({
      name: scholar.name,
      bio: scholar.bio,
      avatarUrl: scholar.avatarUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingScholar) {
      updateMutation.mutate({ id: editingScholar.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A3D35]">Scholars Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage Islamic scholars and their content</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Scholar
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-gray-500">Loading scholars...</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.scholars?.map((scholar) => (
            <motion.div
              key={scholar.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#18F59B] to-[#0A3D35] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {scholar.name[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#0A3D35] mb-1">{scholar.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{scholar.bio}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(scholar)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this scholar?')) {
                        deleteMutation.mutate(scholar.id);
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
        title={editingScholar ? 'Edit Scholar' : 'Add New Scholar'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Textarea
            label="Bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            required
          />
          <Input
            label="Avatar URL"
            value={formData.avatarUrl}
            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
          />
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {editingScholar ? 'Update Scholar' : 'Create Scholar'}
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
