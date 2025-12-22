import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button } from '@tmp/ui';
import { useAuth } from '../auth';
import { FormEvent, useState, useEffect } from 'react';

interface AppSettingsDto {
  id: string;
  maintenanceMode: boolean;
  faqJson?: string | null;
  makkahStreamUrl?: string | null;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3000';

export function SettingsPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [faqDraft, setFaqDraft] = useState('');
  const [makkahStreamUrl, setMakkahStreamUrl] = useState('');

  const { data } = useQuery<{ settings: AppSettingsDto }>({
    queryKey: ['adminAppSettings'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-app-settings`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load settings');
      return (await res.json()) as { settings: AppSettingsDto };
    },
    enabled: !!accessToken,
  });

  useEffect(() => {
    if (!data?.settings) return;

    if (data.settings.faqJson && !faqDraft) {
      setFaqDraft(data.settings.faqJson);
    }
    if (data.settings.makkahStreamUrl && !makkahStreamUrl) {
      setMakkahStreamUrl(data.settings.makkahStreamUrl);
    }
  }, [data, faqDraft, makkahStreamUrl]);

  const mutation = useMutation({
    mutationFn: async (settings: Partial<AppSettingsDto>) => {
      const res = await fetch(`${API_BASE_URL}/api/admin-app-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adminAppSettings'] });
    },
  });

  const settings = data?.settings;

  const toggleMaintenance = () => {
    if (!settings) return;
    mutation.mutate({
      maintenanceMode: !settings.maintenanceMode,
      faqJson: settings.faqJson,
      makkahStreamUrl: settings.makkahStreamUrl || '',
    });
  };

  const handleFaqSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    mutation.mutate({
      maintenanceMode: settings.maintenanceMode,
      faqJson: faqDraft,
      makkahStreamUrl: settings.makkahStreamUrl || '',
    });
  };

  const handleMakkahStreamSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    mutation.mutate({
      maintenanceMode: settings.maintenanceMode,
      faqJson: settings.faqJson,
      makkahStreamUrl: makkahStreamUrl,
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-emerald-50">App settings</h1>
      <Card className="px-4 py-3 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-emerald-100/80 mb-1">Maintenance mode</div>
            <p className="text-[11px] text-emerald-100/70">
              When enabled, public clients can show a friendly maintenance screen while admins continue working.
            </p>
          </div>
          <Button
            variant="secondary"
            className="text-[11px] px-3 py-1"
            disabled={mutation.isPending || !settings}
            onClick={toggleMaintenance}
          >
            {settings?.maintenanceMode ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </Card>
      <Card className="px-4 py-3 text-xs space-y-2">
        <div className="text-emerald-100/80 mb-1">FAQ configuration (JSON)</div>
        <p className="text-[11px] text-emerald-100/70 mb-2">
          Store frequently asked questions as JSON. The marketing site or mobile app can render this dynamically.
        </p>
        <form onSubmit={handleFaqSubmit} className="space-y-2">
          <textarea
            className="w-full h-32 rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50 text-[11px] font-mono"
            value={faqDraft}
            onChange={e => setFaqDraft(e.target.value)}
          />
          <Button
            type="submit"
            variant="secondary"
            className="text-[11px] px-3 py-1"
            disabled={mutation.isPending || !settings}
          >
            Save FAQ JSON
          </Button>
        </form>
      </Card>
      <Card className="px-4 py-3 text-xs space-y-2">
        <div className="text-emerald-100/80 mb-1">Makkah Live Stream URL</div>
        <p className="text-[11px] text-emerald-100/70 mb-2">
          Configure the live stream URL for Makkah. This will be available to users in the mobile app.
        </p>
        <form onSubmit={handleMakkahStreamSubmit} className="space-y-2">
          <input
            type="url"
            className="w-full rounded-xl border border-emerald-400/30 bg-black/40 px-3 py-2 text-emerald-50 text-[11px]"
            placeholder="https://example.com/makkah-stream"
            value={makkahStreamUrl}
            onChange={e => setMakkahStreamUrl(e.target.value)}
          />
          <Button
            type="submit"
            variant="secondary"
            className="text-[11px] px-3 py-1"
            disabled={mutation.isPending || !settings}
          >
            Save Stream URL
          </Button>
        </form>
      </Card>
    </div>
  );
}

