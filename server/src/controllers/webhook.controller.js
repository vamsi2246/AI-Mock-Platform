import { asyncHandler } from "../utils/asyncHandler.js";
import { InterviewService } from "../services/interview.service.js";
import { ConversationEngine } from "../services/conversation.service.js";
import logger from "../utils/logger.js";

/**
 * Webhook handler for Vapi AI callbacks.
 * Vapi sends POST requests with call status updates, transcript data, etc.
 */
export const handleVapiWebhook = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(200).json({ success: true });
    return;
  }

  logger.info("Vapi webhook received", { type: message.type });

  switch (message.type) {
    case "transcript":
      // Real-time transcript update
      if (message.transcript && message.call?.id) {
        const sessionId = message.call.metadata?.sessionId;
        if (sessionId) {
          await InterviewService.saveMessage(
            sessionId,
            message.role === "assistant" ? "ASSISTANT" : "USER",
            message.transcript,
          );
        }
      }
      break;

    case "end-of-call-report":
      // Call completed — Vapi sends final summary
      logger.info("Call ended", {
        callId: message.call?.id,
        duration: message.durationSeconds,
      });
      break;

    case "status-update":
      logger.info("Call status update", {
        callId: message.call?.id,
        status: message.status,
      });
      break;

    case "function-call":
      // Handle any tool/function calls from the assistant
      logger.info("Function call", {
        functionName: message.functionCall?.name,
      });
      break;

    default:
      logger.debug("Unknown webhook event", { type: message.type });
  }

  res.status(200).json({ success: true });
});

/**
 * Webhook handler for Vapi Custom LLM Server URL.
 */
export const handleCustomLLM = asyncHandler(async (req, res) => {
  const { messages, metadata } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Missing messages" });
    return;
  }

  // Parse state from request metadata
  const initialState = {
    messages,
    candidateName: metadata?.candidateName || "Candidate",
    interviewType: metadata?.interviewType || "BEHAVIORAL",
    currentDifficulty: "INTERMEDIATE",
    topicsCovered: [],
    topicsRemaining: ["background", "strengths", "weaknesses"],
    evaluationNotes: [],
  };

  const graph = ConversationEngine.getGraph();
  const finalState = await graph.invoke(initialState);

  // Return exactly the format OpenAI returns, since Vapi expects OpenAI-compatible responses
  res.json({
    id: `chatcmpl-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: "gpt-4o",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: finalState.generatedResponse,
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  });
});
