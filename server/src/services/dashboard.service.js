import prisma from "../lib/prisma.js";

export class DashboardService {
  static async getDashboard(userId) {
    const [totalInterviews, completedInterviews, recentSessions, allReports] =
      await Promise.all([
        prisma.interviewSession.count({ where: { userId } }),
        prisma.interviewSession.count({
          where: { userId, status: "COMPLETED" },
        }),
        prisma.interviewSession.findMany({
          where: { userId },
          include: {
            report: {
              select: { overallScore: true, hiringRecommendation: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.feedbackReport.findMany({
          where: { session: { userId } },
          select: {
            overallScore: true,
            communicationScore: true,
            technicalScore: true,
            confidenceScore: true,
            problemSolvingScore: true,
            createdAt: true,
            session: { select: { type: true } },
          },
          orderBy: { createdAt: "asc" },
        }),
      ]);

    // Calculate average score
    const avgScore =
      allReports.length > 0
        ? Math.round(
            allReports.reduce((sum, r) => sum + r.overallScore, 0) /
              allReports.length,
          )
        : 0;

    // Calculate streak (consecutive days with interviews)
    const streak = await this.calculateStreak(userId);

    // Interview type distribution
    const typeDistribution = await prisma.interviewSession.groupBy({
      by: ["type"],
      where: { userId, status: "COMPLETED" },
      _count: { type: true },
    });

    // Score progression over time
    const scoreProgression = allReports.map((r) => ({
      date: r.createdAt.toISOString().split("T")[0],
      overall: r.overallScore,
      communication: r.communicationScore,
      technical: r.technicalScore,
      confidence: r.confidenceScore,
      problemSolving: r.problemSolvingScore,
      type: r.session.type,
    }));

    // Weekly activity (interviews per day for the last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyActivity = await prisma.interviewSession.groupBy({
      by: ["createdAt"],
      where: { userId, createdAt: { gte: weekAgo } },
      _count: { id: true },
    });

    return {
      stats: {
        totalInterviews,
        completedInterviews,
        averageScore: avgScore,
        streak,
      },
      recentSessions: recentSessions.map((s) => ({
        id: s.id,
        type: s.type,
        status: s.status,
        difficulty: s.difficulty,
        score: s.report?.overallScore ?? null,
        recommendation: s.report?.hiringRecommendation ?? null,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
      })),
      typeDistribution: typeDistribution.map((t) => ({
        type: t.type,
        count: t._count.type,
      })),
      scoreProgression,
      weeklyActivity: weeklyActivity.map((w) => ({
        date: w.createdAt.toISOString().split("T")[0],
        count: w._count.id,
      })),
    };
  }

  static async calculateStreak(userId) {
    const sessions = await prisma.interviewSession.findMany({
      where: { userId, status: "COMPLETED" },
      select: { startedAt: true },
      orderBy: { startedAt: "desc" },
    });

    if (sessions.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastSession = new Date(sessions[0].startedAt);
    lastSession.setHours(0, 0, 0, 0);

    // If last session wasn't today or yesterday, streak is 0
    const diffToday = Math.floor(
      (today.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffToday > 1) return 0;

    for (let i = 1; i < sessions.length; i++) {
      const curr = new Date(sessions[i - 1].startedAt);
      curr.setHours(0, 0, 0, 0);
      const prev = new Date(sessions[i].startedAt);
      prev.setHours(0, 0, 0, 0);

      const diff = Math.floor(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diff <= 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}
