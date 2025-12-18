import { useQuery } from '@tanstack/react-query';
import { Card } from '@tmp/ui';
import { useAuth } from '../auth';

interface CampaignAnalytics {
  id: string;
  title: string;
  goalAmount?: number | null;
  isActive: boolean;
  createdAt: string;
  donationCount: number;
  donationSum: number;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3000';

export function DonationsPage() {
  const { accessToken } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['adminCampaignAnalytics'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin-campaigns-analytics`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load analytics');
      return (await res.json()) as {
        totalCampaigns: number;
        totalDonations: number;
        campaigns: CampaignAnalytics[];
      };
    },
    enabled: !!accessToken,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-emerald-50">Donation campaigns</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="px-4 py-3">
          <div className="text-xs text-emerald-100/80 mb-1">Total campaigns</div>
          <div className="text-2xl text-emerald-50 font-semibold">
            {data?.totalCampaigns ?? (isLoading ? '…' : 0)}
          </div>
        </Card>
        <Card className="px-4 py-3">
          <div className="text-xs text-emerald-100/80 mb-1">Total donations</div>
          <div className="text-2xl text-emerald-50 font-semibold">
            {typeof data?.totalDonations === 'number'
              ? data.totalDonations.toLocaleString()
              : isLoading
              ? '…'
              : 0}
          </div>
          <div className="text-[11px] text-emerald-100/70 mt-1">Sum across all campaigns</div>
        </Card>
      </div>
      <Card className="px-4 py-3 text-xs space-y-2">
        <div className="text-emerald-100/80 mb-2">Campaign breakdown</div>
        {data?.campaigns?.length ? (
          data.campaigns.map(c => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-black/40 px-3 py-2"
            >
              <div>
                <div className="font-semibold text-emerald-50 mb-1">{c.title}</div>
                <div className="text-[11px] text-emerald-100/70">
                  {c.donationCount} donations · {c.donationSum.toLocaleString()} total
                </div>
              </div>
              <div className="text-[11px] text-emerald-100/70">
                {c.isActive ? 'Active' : 'Closed'}
              </div>
            </div>
          ))
        ) : (
          <div className="text-[11px] text-emerald-100/70">
            {isLoading ? 'Loading…' : 'No campaigns yet.'}
          </div>
        )}
      </Card>
    </div>
  );
}

