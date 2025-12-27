import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireRole } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  try {
    await requireRole(req, ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CONTENT_MANAGER']);

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all stats in parallel
    const [
      totalUsers,
      usersThisMonth,
      usersLastMonth,
      totalCampaigns,
      activeCampaigns,
      totalDonations,
      donationsThisMonth,
      openTickets,
      totalTickets,
      messagesToday,
      totalMessages,
      upcomingEvents,
      totalEvents,
      communityPostsToday,
      totalCommunityPosts,
      notificationsToday,
      totalNotifications,
    ] = await Promise.all([
      // Users
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(monthAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
            lt: monthAgo,
          },
        },
      }),
      // Campaigns
      prisma.campaign.count(),
      prisma.campaign.count({ where: { isActive: true } }),
      // Donations
      prisma.donation.aggregate({
        _sum: { amount: true },
      }),
      prisma.donation.count({ where: { createdAt: { gte: monthAgo } } }),
      // Support Tickets
      prisma.supportTicket.count({ where: { status: 'open' } }),
      prisma.supportTicket.count(),
      // Messages
      prisma.message.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.message.count(),
      // Events
      prisma.event.count({
        where: { startDate: { gte: now } },
      }),
      prisma.event.count(),
      // Community Posts
      prisma.communityPost.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.communityPost.count(),
      // Notifications
      prisma.notification.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.notification.count(),
    ]);

    // Calculate growth rates
    const userGrowthRate =
      usersLastMonth > 0
        ? (((usersThisMonth - usersLastMonth) / usersLastMonth) * 100).toFixed(1)
        : usersThisMonth > 0
        ? '100.0'
        : '0.0';

    const totalDonationsAmount = totalDonations._sum?.amount
      ? Number(totalDonations._sum.amount)
      : 0;

    // Get recent activity
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: { select: { name: true } },
      },
    });

    const recentTickets = await prisma.supportTicket.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    ok(res, {
      stats: {
        totalUsers,
        usersThisMonth,
        userGrowthRate: `${userGrowthRate}%`,
        totalCampaigns,
        activeCampaigns,
        totalDonations: totalDonationsAmount,
        donationsThisMonth,
        openTickets,
        totalTickets,
        messagesToday,
        totalMessages,
        upcomingEvents,
        totalEvents,
        communityPostsToday,
        totalCommunityPosts,
        notificationsToday,
        totalNotifications,
      },
      recentActivity: {
        users: recentUsers.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role.name,
          createdAt: u.createdAt,
        })),
        tickets: recentTickets.map((t) => ({
          id: t.id,
          subject: t.subject,
          status: t.status,
          userEmail: t.user.email,
          userName: t.user.name,
          createdAt: t.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('admin-dashboard-analytics error', error);
    if ((error as Error).message === 'FORBIDDEN') {
      return badRequest(res, apiError('FORBIDDEN', 'FORBIDDEN'));
    }
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}

