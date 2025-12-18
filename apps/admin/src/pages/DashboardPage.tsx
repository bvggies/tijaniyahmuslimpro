import { Card } from '@tmp/ui';

export function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="px-4 py-3">
        <div className="text-xs text-emerald-100/80 mb-1">Total users</div>
        <div className="text-2xl text-emerald-50 font-semibold">1 245</div>
        <div className="text-[11px] text-emerald-100/70 mt-1">Sample metric – wire to backend analytics.</div>
      </Card>
      <Card className="px-4 py-3">
        <div className="text-xs text-emerald-100/80 mb-1">Active campaigns</div>
        <div className="text-2xl text-emerald-50 font-semibold">3</div>
        <div className="text-[11px] text-emerald-100/70 mt-1">Donation campaigns currently live.</div>
      </Card>
      <Card className="px-4 py-3">
        <div className="text-xs text-emerald-100/80 mb-1">Open support tickets</div>
        <div className="text-2xl text-emerald-50 font-semibold">7</div>
        <div className="text-[11px] text-emerald-100/70 mt-1">Respond promptly to keep trust high.</div>
      </Card>
    </div>
  );
}


