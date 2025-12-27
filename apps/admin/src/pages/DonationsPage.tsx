import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, Plus, DollarSign, TrendingUp } from 'lucide-react';
import { Card, Button, Input, Modal, Textarea, Badge, Table, TableRow, TableCell } from '../components/ui';
import { useAuth } from '../auth';
import { apiRequest } from '../lib/api';

interface Campaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    donations: number;
  };
}

interface Donation {
  id: string;
  amount: number;
  user: {
    email: string;
    name: string | null;
  } | null;
  campaign: {
    title: string;
  };
  createdAt: string;
}

export function DonationsPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'donations'>('campaigns');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    isActive: true,
  });

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: async () => {
      return apiRequest<{ campaigns: Campaign[] }>('/api/admin-campaigns-analytics', {}, accessToken);
    },
    enabled: !!accessToken && activeTab === 'campaigns',
  });

  const { data: donationsData, isLoading: donationsLoading } = useQuery({
    queryKey: ['admin-donations'],
    queryFn: async () => {
      // This would need a dedicated endpoint
      return apiRequest<{ donations: Donation[] }>('/api/campaigns', {}, accessToken).catch(() => ({ donations: [] }));
    },
    enabled: !!accessToken && activeTab === 'donations',
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/admin-campaigns-analytics', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          goalAmount: data.goalAmount ? parseInt(data.goalAmount) * 100 : null,
        }),
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      goalAmount: '',
      isActive: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A3D35]">Donations & Campaigns</h1>
          <p className="text-sm text-gray-600 mt-1">Manage donation campaigns and track contributions</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Campaign
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'campaigns'
              ? 'text-[#18F59B] border-b-2 border-[#18F59B]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Campaigns
        </button>
        <button
          onClick={() => setActiveTab('donations')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'donations'
              ? 'text-[#18F59B] border-b-2 border-[#18F59B]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Donations
        </button>
      </div>

      {activeTab === 'campaigns' ? (
        campaignsLoading ? (
          <Card>
            <div className="p-8 text-center text-gray-500">Loading campaigns...</div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaignsData?.campaigns?.map((campaign) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-[#0A3D35]">{campaign.title}</h3>
                    <Badge variant={campaign.isActive ? 'success' : 'default'}>
                      {campaign.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Goal:</span>
                      <span className="font-semibold">
                        {campaign.goalAmount ? `$${(campaign.goalAmount / 100).toLocaleString()}` : 'No goal'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Donations:</span>
                      <span className="font-semibold">{campaign._count.donations}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        donationsLoading ? (
          <Card>
            <div className="p-8 text-center text-gray-500">Loading donations...</div>
          </Card>
        ) : (
          <Card padding="none">
            <Table headers={['Donor', 'Campaign', 'Amount', 'Date']}>
              {donationsData?.donations?.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>
                    {donation.user?.name || donation.user?.email || 'Anonymous'}
                  </TableCell>
                  <TableCell>{donation.campaign.title}</TableCell>
                  <TableCell className="font-semibold text-green-600">
                    ${(donation.amount / 100).toLocaleString()}
                  </TableCell>
                  <TableCell>{new Date(donation.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </Table>
          </Card>
        )
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Create Campaign"
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
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            required
          />
          <Input
            label="Goal Amount ($)"
            type="number"
            value={formData.goalAmount}
            onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
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
              Campaign is active
            </label>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              isLoading={createMutation.isPending}
              className="flex-1"
            >
              Create Campaign
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
