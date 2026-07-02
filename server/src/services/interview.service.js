import prisma from "../lib/prisma.js";
import { buildSystemPrompt } from "./ai.service.js";
import { VapiService } from "./vapi.service.js";
import { ApiError } from "../utils/apiError.js";
import logger from "../utils/logger.js";

export class InterviewService {
  /**
   * Start a new interview session:
   * 1. Fetch user profile for context
   * 2. Create session in DB
   * 3. Build dynamic system prompt
   * 4. Build Vapi assistant config
   * 5. Return config to frontend
   */
  static async startInterview(userId, type, difficulty, duration = 1800) {
    // Get candidate profile for prompt context
    const profile = await prisma.profile.findUnique({ where: { userId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw ApiError.notFound("User not found");

    const candidateName = profile
      ? `${profile.firstName} ${profile.lastName}`.trim() || "Candidate"
      : "Candidate";

    // Create session
    const session = await prisma.interviewSession.create({
      data: {
        userId,
        type,
        difficulty,
        duration,
        status: "IN_PROGRESS",
      },
    });

    // Build system prompt with full candidate context
    const systemPrompt = buildSystemPrompt({
      interviewType: type,
      difficulty,
      candidateName,
      targetRole: profile?.targetRole || "Software Engineer",
      currentRole: profile?.currentRole || "Developer",
      yearsExperience: profile?.yearsExperience || 0,
      skills: typeof profile?.skills === 'string' ? JSON.parse(profile.skills) : (profile?.skills || []),
      resumeText: profile?.resumeText,
      duration: Math.round(duration / 60),
    });

    // Build first message
    const firstMessage = VapiService.buildFirstMessage(type, candidateName);

    // Build Vapi assistant config (inline — no dashboard assistant needed)
    const assistantConfig = VapiService.buildAssistantConfig({
      systemPrompt,
      firstMessage,
      interviewType: type,
      candidateName,
    });

    // Store the system prompt as the first message
    await prisma.conversationMessage.create({
      data: {
        sessionId: session.id,
        role: "SYSTEM",
        content: systemPrompt,
      },
    });

    logger.info("Interview session started", {
      sessionId: session.id,
      type,
      difficulty,
      userId,
    });

    return {
      sessionId: session.id,
      assistantConfig,
      duration,
      type,
      difficulty,
    };
  }

  /**
   * End an interview session and save the transcript
   */
  static async endInterview(sessionId, userId, vapiCallId, transcript) {
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) throw ApiError.notFound("Interview session not found");

    // Save transcript messages
    if (transcript && transcript.length > 0) {
      await prisma.conversationMessage.createMany({
        data: transcript.map((msg) => ({
          sessionId,
          role: msg.role === "assistant" ? "ASSISTANT" : "USER",
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        })),
      });
    }

    // If we have a Vapi call ID but no transcript, try fetching from Vapi
    if (vapiCallId && (!transcript || transcript.length === 0)) {
      try {
        const vapiTranscript = await VapiService.getCallTranscript(vapiCallId);
        if (vapiTranscript.length > 0) {
          await prisma.conversationMessage.createMany({
            data: vapiTranscript.map((msg) => ({
              sessionId,
              role:
                msg.role === "assistant"
                  ? "ASSISTANT"
                  : msg.role === "user"
                    ? "USER"
                    : "SYSTEM",
              content: msg.content,
              timestamp: new Date(msg.timestamp),
            })),
          });
        }
      } catch (error) {
        logger.error("Failed to fetch transcript from Vapi", {
          sessionId,
          vapiCallId,
        });
      }
    }

    // Calculate actual duration
    const actualDuration = Math.round(
      (new Date().getTime() - session.startedAt.getTime()) / 1000,
    );

    // Update session
    const updated = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
        actualDuration,
        vapiCallId,
      },
    });

    logger.info("Interview session ended", { sessionId, actualDuration });

    return updated;
  }

  /**
   * Save a single message during an ongoing interview
   */
  static async saveMessage(sessionId, role, content) {
    return prisma.conversationMessage.create({
      data: { sessionId, role, content },
    });
  }

  /**
   * Get interview history for a user
   */
  static async getHistory(userId, page = 1, limit = 10, search) {
    const skip = (page - 1) * limit;

    const where = { userId };
    if (search) {
      where.type = {
        in: ["BEHAVIORAL", "TECHNICAL", "SYSTEM_DESIGN", "HR"].filter((t) =>
          t.toLowerCase().includes(search.toLowerCase()),
        ),
      };
    }

    const [sessions, total] = await Promise.all([
      prisma.interviewSession.findMany({
        where,
        include: {
          report: {
            select: {
              overallScore: true,
              hiringRecommendation: true,
            },
          },
          _count: { select: { messages: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.interviewSession.count({ where }),
    ]);

    return {
      sessions: sessions.map((s) => ({
        id: s.id,
        type: s.type,
        status: s.status,
        difficulty: s.difficulty,
        duration: s.duration,
        actualDuration: s.actualDuration,
        score: s.report?.overallScore ?? null,
        recommendation: s.report?.hiringRecommendation ?? null,
        messageCount: s._count.messages,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        createdAt: s.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single interview session with full transcript
   */
  static async getSession(sessionId, userId) {
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          where: { role: { not: "SYSTEM" } },
          orderBy: { timestamp: "asc" },
        },
        report: true,
      },
    });

    if (!session) throw ApiError.notFound("Session not found");

    return session;
  }

  /**
   * Delete an interview session
   */
  static async deleteSession(sessionId, userId) {
    const session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) throw ApiError.notFound("Session not found");

    await prisma.interviewSession.delete({ where: { id: sessionId } });

    return { success: true };
  }
}
