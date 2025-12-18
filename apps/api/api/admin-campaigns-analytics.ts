import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireRole } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  try {
    await requireRole(req, ['SUPER_ADMIN', 'ADMIN']);

    const campaigns = await prisma.campaign.findMany({
      include: { donations: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalDonations = campaigns.reduce(
      (sum, c) => sum + c.donations.reduce((s, d) => s + d.amount, 0),
      0,
    );

    ok(res, {
      totalCampaigns: campaigns.length,
      totalDonations,
      campaigns: campaigns.map(c => ({
        id: c.id,
        title: c.title,
        goalAmount: c.goalAmount,
        isActive: c.isActive,
        createdAt: c.createdAt,
        donationCount: c.donations.length,
        donationSum: c.donations.reduce((s, d) => s + d.amount, 0),
      })),
    });
  } catch (error) {
    console.error('admin-campaigns-analytics error', error);
    if ((error as Error).message === 'FORBIDDEN') {
      return badRequest(res, apiError('FORBIDDEN', 'FORBIDDEN'));
    }
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}



