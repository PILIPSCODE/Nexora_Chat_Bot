import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';
import { Annotation } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { Product } from '@prisma/client';

export class ChatMessage {
  role: 'assistant' | 'customer';
  content: string;
}

export class AiResponse {
  data: ListMessage;
  tokenUsage: number;
}

export class ListMessage {
  messages: MessageResponse[];
}
export class MessageResponse {
  text: string;
  image?: string | null;
  type: string;
}

export class ProductMessage {
  name: string;
  description?: string;
  price?: string;
  stock?: number;
  image?: string | null;
}

export class WrappedResponse {
  answer: string;
  tokenUsage: number;
}

export type LLMPlatform = ChatGroq | ChatGoogleGenerativeAI | ChatOpenAI;

export const RAGStateAnnotation = Annotation.Root({
  question: Annotation<string>(),
  documents: Annotation<string[]>({
    value: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  answer: Annotation<string>(),
  products: Annotation<string>({
    value: (_, next) => next,
    default: () => '',
  }),

  order: Annotation<string>({
    value: (_, next) => next,
    default: () => '',
  }),

  intent: Annotation<'PRODUCT' | 'LEAD' | 'ORDER' | 'HUMAN_HANDLE' | null>(),
  chatHistory: Annotation<ChatMessage[]>({
    value: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  tokenUsage: Annotation<number>({
    value: (prev, next) => (prev ?? 0) + (next ?? 0),
    default: () => 0,
  }),
});

export type RAGState = typeof RAGStateAnnotation.State;
