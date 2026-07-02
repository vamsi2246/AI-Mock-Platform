import openai from "../lib/openai.js";
import prisma from "../lib/prisma.js";
import { buildReportPrompt } from "./ai.service.js";
import { ApiError } from "../utils/apiError.js";
import logger from "../utils/logger.js";

export class ReportService {
  /**
   * Generate a comprehensive feedback report from an interview transcript
   * using GPT-4.1 / GPT-4o for analysis.
   */
  static async generateReport(sessionId, userId) {
    // Check if report already exists
    const existing = await prisma.feedbackReport.findUnique({
      where: { sessionId },
    });
    if (existing) return existing;

    // Get session with messages
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          where: { role: { not: "SYSTEM" } },
          orderBy: { timestamp: "asc" },
        },
        user: {
          include: { profile: true },
        },
      },
    });

    if (!session) throw ApiError.notFound("Interview session not found");
    if (session.status !== "COMPLETED") {
      throw ApiError.badRequest(
        "Interview must be completed before generating a report",
      );
    }
    if (session.messages.length === 0) {
      throw ApiError.badRequest(
        "No conversation transcript found for this session",
      );
    }

    const candidateName = session.user.profile
      ? `${session.user.profile.firstName} ${session.user.profile.lastName}`.trim()
      : "Candidate";

    const targetRole = session.user.profile?.targetRole || "Software Engineer";

    // Build the report generation prompt
    const prompt = buildReportPrompt(
      session.type,
      session.difficulty,
      session.messages.map((m) => ({
        role: m.role.toLowerCase(),
        content: m.content,
      })),
      candidateName,
      targetRole,
    );

    // Call GPT-4.1 for analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw ApiError.internal(
        "Failed to generate report — no response from AI",
      );
    }

    let reportData;
    try {
      reportData = JSON.parse(responseText);
    } catch {
      logger.error("Failed to parse report JSON", { sessionId, responseText });
      throw ApiError.internal("Failed to parse AI response");
    }

    // Save report to database
    const report = await prisma.feedbackReport.create({
      data: {
        sessionId,
        overallScore: reportData.overallScore ?? 0,
        communicationScore: reportData.communicationScore ?? 0,
        technicalScore: reportData.technicalScore ?? 0,
        confidenceScore: reportData.confidenceScore ?? 0,
        problemSolvingScore: reportData.problemSolvingScore ?? 0,
        leadershipScore: reportData.leadershipScore ?? 0,
        strengths: reportData.strengths ?? [],
        weaknesses: reportData.weaknesses ?? [],
        improvements: reportData.improvements ?? [],
        hiringRecommendation: reportData.hiringRecommendation ?? "N/A",
        summary: reportData.summary ?? "",
        detailedFeedback: reportData,
      },
    });

    // Create individual category scores
    const categories = [
      { category: "Communication", score: reportData.communicationScore },
      { category: "Technical Knowledge", score: reportData.technicalScore },
      { category: "Confidence", score: reportData.confidenceScore },
      { category: "Problem Solving", score: reportData.problemSolvingScore },
      { category: "Leadership", score: reportData.leadershipScore },
    ];

    await prisma.sessionScore.createMany({
      data: categories.map((c) => ({
        sessionId,
        reportId: report.id,
        category: c.category,
        score: c.score ?? 0,
        maxScore: 100,
      })),
    });

    logger.info("Report generated", {
      sessionId,
      overallScore: report.overallScore,
    });

    return report;
  }

  /**
   * Get a report by session ID
   */
  static async getReport(sessionId, userId) {
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw ApiError.notFound("Session not found");

    const report = await prisma.feedbackReport.findUnique({
      where: { sessionId },
      include: {
        scores: true,
        session: {
          select: {
            type: true,
            difficulty: true,
            duration: true,
            actualDuration: true,
            startedAt: true,
            endedAt: true,
            messages: {
              where: { role: { not: "SYSTEM" } },
              orderBy: { timestamp: "asc" },
              select: { role: true, content: true, timestamp: true },
            },
          },
        },
      },
    });

    if (!report)
      throw ApiError.notFound("Report not found. Generate it first.");

    return report;
  }
}
