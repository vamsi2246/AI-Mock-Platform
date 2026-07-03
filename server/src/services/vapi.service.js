import { env } from "../config/env.js";
import logger from "../utils/logger.js";

// ─── Vapi AI Service ──────────────────────────────
// Handles creating transient assistants and managing voice calls
// via the Vapi REST API. We use inline assistants for maximum
// flexibility — no pre-created dashboard assistants needed.

const VAPI_BASE_URL = "https://api.vapi.ai";

// Voice mapping — different voices for different interviewer personas
const VOICE_MAP = {
  BEHAVIORAL: { provider: "vapi", voiceId: "Emma" },
  TECHNICAL: { provider: "vapi", voiceId: "Elliot" },
  SYSTEM_DESIGN: { provider: "vapi", voiceId: "Clara" },
  HR: { provider: "vapi", voiceId: "Nico" },
};

export class VapiService {
  /**
   * Build the inline assistant configuration to pass to vapi.start() on the client.
   * We don't create a persistent assistant in the Vapi dashboard — instead we pass
   * the full config to the frontend so vapi.start() uses it as a transient assistant.
   */
  static buildAssistantConfig(config) {
    const voice = VOICE_MAP[config.interviewType] || VOICE_MAP.BEHAVIORAL;

    return {
      name: `Interview-${config.interviewType}-${Date.now()}`,
      model: {
        provider: env.VAPI_CUSTOM_LLM_URL ? "custom-llm" : "openai",
        model: "gpt-4o",
        ...(env.VAPI_CUSTOM_LLM_URL ? { url: env.VAPI_CUSTOM_LLM_URL } : {}),
        messages: [
          {
            role: "system",
            content: config.systemPrompt,
          },
        ],
        temperature: 0.85,
        maxTokens: 500,
      },
      voice: voice,
      firstMessage: config.firstMessage,
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en",
      },
      silenceTimeoutSeconds: 30,
      maxDurationSeconds: 3600,
      endCallMessage:
        "Thank you so much for your time today. It was a pleasure speaking with you. You'll receive your detailed feedback shortly. Best of luck!",
      metadata: {
        interviewType: config.interviewType,
        candidateName: config.candidateName,
      },
    };
  }

  /**
   * Build the first message for each interview type
   */
  static buildFirstMessage(interviewType, candidateName) {
    const messages = {
      BEHAVIORAL: `Hi ${candidateName}! I'm Sarah. Thanks for joining me today. This is going to be a behavioral interview where I'd love to hear about your experiences, how you've handled different situations, and what drives you. There are no right or wrong answers — I just want to get to know the real you. Ready to get started?`,
      TECHNICAL: `Hey ${candidateName}, I'm Alex. Welcome to the technical interview. Today we'll have a conversation about your technical experience — I'm less interested in textbook definitions and more interested in how you think about building real systems. Feel free to think out loud. Shall we dive in?`,
      SYSTEM_DESIGN: `Hi ${candidateName}, I'm Priya. Welcome! Today we're going to work through a system design problem together. Think of me as a collaborator — I'll ask questions and push back on some choices, but that's just because I want to understand your thinking. Don't worry about getting to a perfect answer. Ready?`,
      HR: `Hi ${candidateName}! I'm Michael. Thanks for making time for this conversation. This is really about getting to know each other — I want to understand what excites you, how you work, and what you're looking for next. It should feel more like a conversation than an interview. Sound good?`,
    };

    return messages[interviewType] || messages.BEHAVIORAL;
  }

  /**
   * Fetch call details from Vapi (for retrieving transcripts after call ends)
   */
  static async getCallDetails(callId) {
    try {
      const response = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
        headers: {
          Authorization: `Bearer ${env.VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Vapi API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error("Failed to fetch Vapi call details", {
        callId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Get the transcript from a completed Vapi call
   */
  static async getCallTranscript(callId) {
    try {
      const callDetails = await this.getCallDetails(callId);
      if (callDetails.messages) {
        return callDetails.messages.map((msg) => ({
          role: msg.role,
          content: msg.content || msg.text || "",
          timestamp: msg.time || new Date().toISOString(),
        }));
      }

      if (callDetails.transcript) {
        return [
          {
            role: "system",
            content: callDetails.transcript,
            timestamp: new Date().toISOString(),
          },
        ];
      }

      return [];
    } catch (error) {
      logger.error("Failed to get call transcript", {
        callId,
        error: String(error),
      });
      return [];
    }
  }
}
