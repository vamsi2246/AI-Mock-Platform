import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { env } from "../config/env.js";
import { PromptBuilder } from "./prompt.builder.js";

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

    const prompt = PromptBuilder.buildEvaluatorPrompt(state);

    try {
      const response = await this.llm.invoke([
        { role: "system", content: prompt },
      ]);
      const parsed = JSON.parse(response.content);
      return {
        evaluationNotes: [parsed.evaluationNote],
        nextAction: parsed.action,
        currentDifficulty: parsed.action === "INCREASE_DIFFICULTY" ? "HARD" : state.currentDifficulty
      };
    } catch {
      return { nextAction: "FOLLOW_UP" };
    }
  }

  static async generateResponse(state) {
    const systemPrompt = PromptBuilder.buildResponseGeneratorPrompt(state);

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
