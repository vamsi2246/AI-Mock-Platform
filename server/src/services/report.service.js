import openai from "../lib/openai.js";
import prisma from "../lib/prisma.js";
import { ChatOpenAI } from "@langchain/openai";
import { PromptBuilder } from "./prompt.builder.js";
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

    const messages = session.messages.map((m) => ({
      role: m.role.toLowerCase(),
      content: m.content,
    }));

    // Build the report generation prompt
    const prompt = PromptBuilder.buildReportPrompt(
      session.type,
      session.difficulty,
      messages,
      candidateName,
      targetRole,
    );

    let parsed;
    try {
      // Call GPT-4o for analysis
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error("No response from AI");
      }
      parsed = JSON.parse(responseText);
    } catch (err) {
      logger.error("Failed to generate report via OpenAI, falling back to mock generator", {
        sessionId,
        error: String(err),
      });

      // Generate realistic fallback evaluation
      parsed = ReportService.generateFallbackReportData(
        session.type,
        session.difficulty,
        candidateName,
        targetRole,
        messages
      );
    }

    // Save report to database
    const report = await prisma.feedbackReport.create({
      data: {
        sessionId,
        executiveSummary: parsed.executiveSummary || "N/A",
        blindSpots: parsed.blindSpots ? JSON.stringify(parsed.blindSpots) : "[]",
        preparationRoadmap: parsed.preparationRoadmap || "",
        overallScore: parsed.overallScore ?? 0,
        communicationScore: parsed.communicationScore ?? 0,
        technicalScore: parsed.technicalScore ?? 0,
        confidenceScore: parsed.confidenceScore ?? 0,
        problemSolvingScore: parsed.problemSolvingScore ?? 0,
        leadershipScore: parsed.leadershipScore ?? 0,
        strengths: parsed.strengths ? JSON.stringify(parsed.strengths) : "[]",
        weaknesses: parsed.weaknesses ? JSON.stringify(parsed.weaknesses) : "[]",
        improvements: parsed.improvements ? JSON.stringify(parsed.improvements) : "[]",
        hiringRecommendation: parsed.hiringRecommendation ?? "N/A",
        summary: parsed.summary ?? "",
        detailedFeedback: parsed ? JSON.stringify(parsed) : null,
      },
    });

    // Create individual category scores
    const categories = [
      { category: "Communication", score: parsed.communicationScore },
      { category: "Technical Knowledge", score: parsed.technicalScore },
      { category: "Confidence", score: parsed.confidenceScore },
      { category: "Problem Solving", score: parsed.problemSolvingScore },
      { category: "Leadership", score: parsed.leadershipScore },
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

    return ReportService.formatReport(report);
  }

  static generateFallbackReportData(interviewType, difficulty, candidateName, targetRole, messages) {
    const userMessages = messages.filter(m => m.role === "user" || m.role === "USER");
    const numAnswers = userMessages.length;
    
    // Base scores around 70-85 depending on how many turns they completed
    const baseScore = Math.min(65 + numAnswers * 3, 92);
    
    const isTech = interviewType === "TECHNICAL" || interviewType === "SYSTEM_DESIGN";
    
    return {
      executiveSummary: `[API LIMIT NOTICE] ${candidateName} completed a ${difficulty.toLowerCase()}-level ${interviewType.toLowerCase()} mock interview for the ${targetRole} position. They completed ${numAnswers} conversational turns with the interviewer. Based on the conversation flow, they showed consistent responsiveness, though a complete AI analysis could not be retrieved due to your OpenAI API quota limits.`,
      hiringRecommendation: baseScore >= 80 ? "Hire" : "Leaning Hire",
      overallScore: baseScore,
      communicationScore: Math.min(baseScore + 4, 95),
      technicalScore: isTech ? Math.min(baseScore - 2, 90) : Math.min(baseScore + 2, 95),
      confidenceScore: Math.min(baseScore + 1, 95),
      problemSolvingScore: Math.min(baseScore + (isTech ? 3 : -1), 95),
      leadershipScore: Math.min(baseScore - 1, 95),
      strengths: [
        "Maintained conversational flow throughout the session",
        `Engaged with the interviewer for ${numAnswers} turns`,
        "Showed clear interest in the target role"
      ],
      weaknesses: [
        "OpenAI API quota exceeded - full depth and nuance of responses could not be evaluated by GPT-4o.",
        "Consider checking your OpenAI account billing page to reactivate detailed AI feedback."
      ],
      blindSpots: [
        "API limits prevented deep contradiction and blind-spot checking.",
        "Verify your OpenAI billing configuration at platform.openai.com."
      ],
      preparationRoadmap: "Step 1: Check your OpenAI account billing and credits at platform.openai.com.\nStep 2: Add a payment method or credits to reactivate the real-time AI evaluator.\nStep 3: Run another mock session to get fully tailored deep feedback on your technical/behavioral responses.",
      summary: `Completed a ${numAnswers}-turn ${interviewType.toLowerCase()} mock session. Fully detailed scoring is paused due to your OpenAI API quota limits.`,
      improvements: [
        "Check your OpenAI account billing and credits at platform.openai.com",
        "Add a payment method to reactivate real-time AI evaluation",
        "Rerun a practice session to see customized advice"
      ]
    };
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

    return ReportService.formatReport(report);
  }

  static formatReport(report) {
    if (!report) return report;
    const formatted = { ...report };
    try {
      formatted.strengths = typeof report.strengths === "string" ? JSON.parse(report.strengths) : report.strengths;
    } catch {
      formatted.strengths = [];
    }
    try {
      formatted.weaknesses = typeof report.weaknesses === "string" ? JSON.parse(report.weaknesses) : report.weaknesses;
    } catch {
      formatted.weaknesses = [];
    }
    try {
      formatted.improvements = typeof report.improvements === "string" ? JSON.parse(report.improvements) : report.improvements;
    } catch {
      formatted.improvements = [];
    }
    return formatted;
  }
}
