import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings, Save, AlertTriangle } from 'lucide-react';
import { Card, Button, Input, Textarea } from '../components/ui';
import { useAuth } from '../auth';
import { apiRequest } from '../lib/api';

export function SettingsPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    maintenanceMode: false,
    faqJson: '',
    makkahStreamUrl: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-app-settings'],
    queryFn: async () => {
      return apiRequest<{ settings: any }>('/api/admin-app-settings', {}, accessToken);
    },
    enabled: !!accessToken,
  });

  useEffect(() => {
    if (data?.settings) {
      setFormData({
        maintenanceMode: data.settings.maintenanceMode || false,
        faqJson: data.settings.faqJson || '',
        makkahStreamUrl: data.settings.makkahStreamUrl || '',
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/admin-app-settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-app-settings'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-8 text-center text-gray-500">Loading settings...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A3D35]">App Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Configure application-wide settings</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="space-y-6">
            {/* Maintenance Mode */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-900">Maintenance Mode</label>
                    <input
                      type="checkbox"
                      checked={formData.maintenanceMode}
                      onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-[#18F59B] focus:ring-[#18F59B]"
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    When enabled, the app will be unavailable to regular users
                  </p>
                </div>
              </div>
            </div>

            {/* Makkah Stream URL */}
            <Input
              label="Default Makkah Stream URL"
              value={formData.makkahStreamUrl}
              onChange={(e) => setFormData({ ...formData, makkahStreamUrl: e.target.value })}
              placeholder="https://..."
            />

            {/* FAQ JSON */}
            <Textarea
              label="FAQ JSON"
              value={formData.faqJson}
              onChange={(e) => setFormData({ ...formData, faqJson: e.target.value })}
              rows={10}
              placeholder='[{"question": "...", "answer": "..."}]'
            />

            <div className="flex items-center justify-end pt-4 border-t border-gray-200">
              <Button
                type="submit"
                isLoading={updateMutation.isPending}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
