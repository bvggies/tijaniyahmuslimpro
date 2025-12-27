import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, Button, Input, Modal, Textarea, Select } from '../components/ui';
import { useAuth } from '../auth';
import { apiRequest } from '../lib/api';

interface Dua {
  id: string;
  title: string;
  arabic: string;
  translation: string;
  reference: string | null;
  categoryId: string | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

export function DuasPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDua, setEditingDua] = useState<Dua | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    arabic: '',
    translation: '',
    reference: '',
    categoryId: '',
  });

  const { data: duasData, isLoading } = useQuery({
    queryKey: ['admin-duas'],
    queryFn: async () => {
      return apiRequest<{ duas: Dua[]; categories: Category[] }>('/api/admin-duas', {}, accessToken);
    },
    enabled: !!accessToken,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/admin-duas', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          categoryId: data.categoryId || null,
        }),
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-duas'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      return apiRequest(`/api/admin-duas?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...data,
          categoryId: data.categoryId || null,
        }),
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-duas'] });
      setIsModalOpen(false);
      setEditingDua(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin-duas?id=${id}`, {
        method: 'DELETE',
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-duas'] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      arabic: '',
      translation: '',
      reference: '',
      categoryId: '',
    });
    setEditingDua(null);
  };

  const handleEdit = (dua: Dua) => {
    setEditingDua(dua);
    setFormData({
      title: dua.title,
      arabic: dua.arabic,
      translation: dua.translation,
      reference: dua.reference || '',
      categoryId: dua.categoryId || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDua) {
      updateMutation.mutate({ id: editingDua.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A3D35]">Duas Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage Islamic duas and supplications</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Dua
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-gray-500">Loading duas...</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {duasData?.duas?.map((dua) => (
            <motion.div
              key={dua.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <h3 className="text-lg font-semibold text-[#0A3D35] mb-3">{dua.title}</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-lg text-right font-arabic mb-2">{dua.arabic}</p>
                    <p className="text-sm text-gray-600">{dua.translation}</p>
                  </div>
                  {dua.reference && (
                    <p className="text-xs text-gray-500">Reference: {dua.reference}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(dua)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this dua?')) {
                        deleteMutation.mutate(dua.id);
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
        title={editingDua ? 'Edit Dua' : 'Add New Dua'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Textarea
            label="Arabic Text"
            value={formData.arabic}
            onChange={(e) => setFormData({ ...formData, arabic: e.target.value })}
            rows={3}
            className="text-right font-arabic"
            required
          />
          <Textarea
            label="Translation"
            value={formData.translation}
            onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
            rows={3}
            required
          />
          <Input
            label="Reference (Optional)"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
          />
          <Select
            label="Category (Optional)"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            options={[
              { value: '', label: 'No Category' },
              ...(duasData?.categories?.map((cat) => ({
                value: cat.id,
                label: cat.name,
              })) || []),
            ]}
          />
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {editingDua ? 'Update Dua' : 'Create Dua'}
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
