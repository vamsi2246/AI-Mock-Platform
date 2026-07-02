import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { env } from "../config/env.js";

// Define the Graph State
export const InterviewStateAnnotation = Annotation.Root({
  messages: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  candidateName: Annotation(),
  interviewType: Annotation(),
  topicsCovered: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  topicsRemaining: Annotation(),
  currentDifficulty: Annotation(),
  evaluationNotes: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  nextAction: Annotation(),
  generatedResponse: Annotation(),
});

export class ConversationEngine {
  static llm = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0.7,
    openAIApiKey: env.OPENAI_API_KEY,
  });

  static async evaluateAnswer(state) {
    const lastUserMessage = [...state.messages]
      .reverse()
      .find((m) => m.role === "user" || m._getType?.() === "human");
    if (!lastUserMessage) {
      return { nextAction: "GENERATE_QUESTION" };
    }

    const prompt = `You are a strict technical interviewer evaluating this candidate's last answer.
    Interview Type: ${state.interviewType}
    Current Difficulty: ${state.currentDifficulty}
    
    Candidate Answer: "${lastUserMessage.content}"
    
    Evaluate based on confidence, completeness, technical depth, communication, and ambiguity.
    Then decide ONE next action from: [FOLLOW_UP, CHALLENGE, CLARIFY, INCREASE_DIFFICULTY, NEXT_TOPIC].
    
    Output strictly in JSON format:
    {
      "evaluationNote": "brief note on what they missed or did well",
      "action": "FOLLOW_UP"
    }`;

    try {
      const response = await this.llm.invoke([
        { role: "system", content: prompt },
      ]);
      const parsed = JSON.parse(response.content);
      return {
        evaluationNotes: [parsed.evaluationNote],
        nextAction: parsed.action,
      };
    } catch {
      return { nextAction: "FOLLOW_UP" };
    }
  }

  static async generateResponse(state) {
    const systemPrompt = `You are an expert ${state.interviewType} interviewer talking to ${state.candidateName}.
    Your goal is to conduct a natural, rigorous interview.
    
    Current State:
    - Difficulty: ${state.currentDifficulty}
    - Recent Evaluation: ${state.evaluationNotes[state.evaluationNotes.length - 1] || "None"}
    - Desired Action: ${state.nextAction}
    
    Instructions based on Desired Action:
    - FOLLOW_UP: Ask a probing question about a specific detail they just mentioned.
    - CHALLENGE: Politely point out a flaw or edge case in their previous answer and ask how they'd handle it.
    - CLARIFY: Ask them to explain a vague point more clearly.
    - INCREASE_DIFFICULTY: Introduce a more complex constraint to the current problem.
    - NEXT_TOPIC: Move on to the next topic gracefully.
    
    Keep your response concise, spoken naturally (no markdown or bullet points). React directly to their previous answer before asking the next question.`;

    const llmMessages = [
      new SystemMessage(systemPrompt),
      ...state.messages.map((m) => {
        if (m.role === "user") return new HumanMessage(m.content);
        if (m.role === "assistant") return new AIMessage(m.content);
        return new HumanMessage(m.content);
      }),
    ];

    const response = await this.llm.invoke(llmMessages);
    return { generatedResponse: response.content };
  }

  static getGraph() {
    const builder = new StateGraph(InterviewStateAnnotation)
      .addNode("evaluateAnswer", this.evaluateAnswer.bind(this))
      .addNode("generateResponse", this.generateResponse.bind(this))
      .addEdge(START, "evaluateAnswer")
      .addEdge("evaluateAnswer", "generateResponse")
      .addEdge("generateResponse", END);

    return builder.compile();
  }
}
