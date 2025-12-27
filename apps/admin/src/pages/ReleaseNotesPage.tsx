import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, Button, Input, Modal, Textarea } from '../components/ui';
import { useAuth } from '../auth';
import { apiRequest } from '../lib/api';

interface ReleaseNote {
  id: string;
  version: string;
  title: string;
  body: string;
  createdAt: string;
}

export function ReleaseNotesPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ReleaseNote | null>(null);
  const [formData, setFormData] = useState({
    version: '',
    title: '',
    body: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-release-notes'],
    queryFn: async () => {
      return apiRequest<{ notes: ReleaseNote[] }>('/api/admin-release-notes', {}, accessToken);
    },
    enabled: !!accessToken,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/admin-release-notes', {
        method: 'POST',
        body: JSON.stringify(data),
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-release-notes'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      return apiRequest(`/api/admin-release-notes?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-release-notes'] });
      setIsModalOpen(false);
      setEditingNote(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin-release-notes?id=${id}`, {
        method: 'DELETE',
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-release-notes'] });
    },
  });

  const resetForm = () => {
    setFormData({ version: '', title: '', body: '' });
    setEditingNote(null);
  };

  const handleEdit = (note: ReleaseNote) => {
    setEditingNote(note);
    setFormData({
      version: note.version,
      title: note.title,
      body: note.body,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A3D35]">Release Notes</h1>
          <p className="text-sm text-gray-600 mt-1">Manage app release notes and updates</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Release Note
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <div className="p-8 text-center text-gray-500">Loading release notes...</div>
        </Card>
      ) : (
        <div className="space-y-4">
          {data?.notes?.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-[#18F59B]/10 text-[#18F59B] rounded-full text-sm font-semibold">
                        v{note.version}
                      </span>
                      <h3 className="text-lg font-semibold text-[#0A3D35]">{note.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(note)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this release note?')) {
                          deleteMutation.mutate(note.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{note.body}</p>
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
        title={editingNote ? 'Edit Release Note' : 'Create Release Note'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Version"
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            placeholder="e.g., 1.2.0"
            required
          />
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Textarea
            label="Body"
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            rows={8}
            required
          />
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {editingNote ? 'Update Note' : 'Create Note'}
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
