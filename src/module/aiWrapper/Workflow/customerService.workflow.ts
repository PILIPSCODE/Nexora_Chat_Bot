import { Injectable } from '@nestjs/common';
import { Product, UserAgent } from '@prisma/client';
import { StateGraph } from '@langchain/langgraph';
import {
  LLMPlatform,
  RAGState,
  RAGStateAnnotation,
  WrappedResponse,
} from 'src/model/Rag.model';
import { START, END } from '@langchain/langgraph';
import { ChoosenLLmService } from '../service/ChoosenLLm.service';
import { ChatMemoryRedisService } from '../ChatMemoryRedis.service';
import { VectorStoreService } from 'src/module/vector/service/vectoreStore.service';
import { XenovaEmbeddings } from 'src/module/embedding/service/xenovaEmbbeding.service';
import { PrismaService } from 'src/module/prisma/service/prisma.service';
import { RAGService } from '../service/RAG.service';
import { OpenAiEmbbedingService } from 'src/module/embedding/service/openAIEmbedding.service';
import { SupabaseStoreService } from 'src/module/vector/service/supabaseStore.service';
import { PostgreStoreService } from 'src/module/vector/service/postgreStore.service';

@Injectable()
export class CustomerServiceWorkFlow {
  constructor(
    private readonly choosenLLmService: ChoosenLLmService,
    private ragService: RAGService,
    private readonly vectorStoreService:PostgreStoreService, // VectorStoreService, SupabaseStoreService
    private readonly embeddingService: XenovaEmbeddings,
    private readonly openAiEmbbedingService: OpenAiEmbbedingService,
    private prismaService: PrismaService,
    private chatMemory: ChatMemoryRedisService,
  ) {}

  // 1. New Inquiry      (customer baru chat)
  // 2. Contacted        (sudah dibalas)
  // 3. Interested       (tertarik produk)
  // 4. Waiting Payment  (menunggu bayar)
  // 5. Paid             (sudah bayar)
  // 6. Completed        (selesai)
  // 7. Cancelled        (batal)

  async workflow(
    agent: UserAgent,
    question: string,
    sessionId: string,
  ): Promise<WrappedResponse | undefined> {
    const llm = await this.choosenLLmService.chooseLLM(
      'groq',
      'llama-3.3-70b-versatile',
      process.env.GROQ_API_KEY || '',
    );

    if (!llm) return;

    const graph = new StateGraph(RAGStateAnnotation)
      .addNode('classify', (s) => this.classifyIntent(s, agent))
      .addNode('retrieve', (s) => this.ragService.Retrieve(s, agent))
      .addNode('product', (s) => this.product(s, agent))
      .addNode('orders', (s) => this.order(s, agent))
      .addNode('humanHandle', (s) => this.humanHandle(s, agent, sessionId))
      .addNode('generate', (s) => this.ragService.Generate(s, agent, llm));

    graph.addEdge(START, 'classify');
    graph.addEdge('classify', 'retrieve');
    graph.addConditionalEdges('retrieve', this.condtionalStages);
    graph.addEdge('product', 'generate');
    graph.addEdge('orders', 'humanHandle');
    graph.addEdge('humanHandle', 'generate');
    graph.addEdge('generate', END);

    const app = graph.compile();
    const history = await this.chatMemory.getHistory(sessionId);
    const result = await app.invoke({
      question,
      chatHistory: [...history, { role: 'customer', content: question }],
    });

    await this.chatMemory.appendMessage(sessionId, {
      role: 'customer',
      content: question,
    });

    await this.chatMemory.appendMessage(sessionId, {
      role: 'assistant',
      content: result.answer,
    });

    return {
      answer: result.answer,
      tokenUsage: result.tokenUsage,
    };
  }

  async classifyIntent(state: RAGState, agent: UserAgent) {
    const category = `
      - START
      - ASK
      - PRODUCT
      - COMPLAIN
      - ORDER 
      - END
    `;
    const res = await this.ragService.classifyTools(state, category, agent);
    console.log(res);

    return {
      intent: res,
    };
  }
  async product(state: RAGState, agent: UserAgent) {
    const category = `
      - PRODUCT SINGLE (ONE SPESIFIC PRODUCT)
      - PRODUCT LIST (MULTIPLE SPESIFIC PRODUCT)
      - PRODUCT ALL (ALL PRODUCT)
    `;
    const res = await this.ragService.classifyTools(
      state,
      category,
      agent,
      'product',
    );

    const collection = 'AgentUserProduct';
    const baseFilter = {
      must: [{ key: 'userId', match: { value: agent.userId } }],
    };

    // Product All

    if (res === 'PRODUCT ALL') {
      const results = await this.vectorStoreService.searchByFilter(
        collection,
        baseFilter,
      );

      const productIds = results?.points?.map((r) =>
        String(r.payload?.metadata?.productId ?? r.payload?.productId),
      );

      const data = await this.prismaService.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      const productSerialiase = await this.productSerialiase(data);

      return {
        products: productSerialiase,
      };
    }

    // Product Single or List

    // const embedding = await this.embeddingService.embedQuery(state.question);
    const last2hist = state.chatHistory
      .slice(-2)
      .map((h) => h.content)
      .join(' ');

    const embedding = await this.openAiEmbbedingService.embedQuery(
      `${state.question}\n${last2hist}`,
    );

    if (!embedding) return;

    const results = await this.vectorStoreService.similaritySearch(
      embedding,
      collection,
      baseFilter,
      3,
    );

    const productIds =
      results?.map((r) =>
        String(r.metadata?.productId ?? r.payload?.productId),
      ) || [];

    if (productIds.length !== 0) {
      const data = await this.prismaService.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      const productSerialiase = await this.productSerialiase(data);

      return {
        products: productSerialiase,
      };
    }
  }

  async order(state: RAGState, agent: UserAgent) {
    return {
      order:
        'Klien sekarang siap untuk melakukan pemesanan ANSWER = Terima kasih, kami akan mengalihkan Anda ke Customer Service. asli kami!!',
    };
  }
  async humanHandle(state: RAGState, agent: UserAgent, sessionId: string) {
    const data = await this.prismaService.conversation.findFirst({
      where: {
        room: sessionId,
      },
    });

    if (!data) return;

    await this.prismaService.conversation.update({
      where: {
        id: data?.id,
      },
      data: {
        humanHandle: true,
      },
    });
  }

  async condtionalStages(state: RAGState) {
    let stage = '';
    switch (state.intent) {
      case 'ORDER':
        stage = 'orders';
        break;
      case 'HUMAN_HANDLE':
        stage = 'humanHandle';
        break;
      case 'PRODUCT':
        stage = 'product';
        break;
      default:
        stage = 'generate';
        break;
    }
    return stage;
  }

  async productSerialiase(product: Product[]) {
    let context = `Toko menjual produk-produk berikut:\n`;

    product.forEach((p, index) => {
      context += `
          ${index + 1}. ${p.name}
          Deskripsi: ${p.description || 'Tidak tersedia'}
          Harga: ${p.price || 'Tidak tersedia'}
          Stok: ${p.stock}
          ${p.image ? `IMAGE_PATH: ${p.image}` : 'Gambar: Tidak tersedia'}
        `;
    });

    return context.trim();
  }

  customerServicePrompt(
    agentPrompt: string | null,
    memory: string,
    state: RAGState,
  ) {
    const contextSections: string[] = [];

    if (state.documents?.length) {
      contextSections.push(`
        # KNOWLEDGE DOCUMENTS:
        ${state.documents.join('\n\n')}
        `);
    }

    if (state.order) {
      contextSections.push(`
        # ORDER STATUS:
        ${state.order}
        `);
    }

    const context = contextSections.join('\n\n');
    return `
      HARD RULES:
      - Do not invent information
      - Only answer from provided context

      YOUR_CHARACTHER: 
      ${agentPrompt || ''}

    


      QUERY TYPE:
      - INFORMATIONAL: questions about products, pricing, availability, operating hours, policies
      - CONVERSATIONAL: greetings, thank-you messages, confirmations, emotions

      CONVERSATIONAL RULE:
      - For CONVERSATIONAL queries, respond briefly and in a friendly manner
      - It is not mandatory to use the KNOWLEDGE CONTEXT

      STRICT GUIDELINES:
      - Answers MUST be based on the KNOWLEDGE CONTEXT / CONVERSATION HISTORY
      - Do not add information outside the context
      - If the information is not available, respond politely and naturally:
        "Sorry, this information is not available in our data at the moment 🙏"
      - Maximum answer length: 2–3 sentences
      - Do not use phrases such as "based on the data" or "context"

        IMAGE RULES (VERY IMPORTANT):
      - You MUST ONLY include "image" if an EXACT IMAGE_PATH string already exists in the PRODUCT INFORMATION.
      - You MUST copy the IMAGE_PATH EXACTLY as written .
      - You MUST NOT create, guess, or modify image paths.
      - If no image path exists in the context, set image to null.
      
      PRODUCT RULE (OVERRIDING):
      - Each product → 1 message
      - Do not combine products
      - Use a light, friendly promotional tone

      PRODUCT SPLIT RULE (MANDATORY):
      - If the knowledge context contains more than one product:
      - You MUST return multiple messages
      - Each message MUST represent exactly ONE product
      - Each message MUST include the corresponding IMAGE_PATH
      - NEVER summarize or combine multiple products in one message

      ORDER RULE (IMPORTANT):
      - IF THE ORDER IS COMPLETE AND FINISHED, END THE CONVERSATION, SAY THANK YOU, AND SWITCH TO A HUMAN CUSTOMER SERVICE REPRESENTATIVE.
    
    
      CONVERSATION HISTORY:
      ${memory || 'No previous conversation.'}

      KNOWLEDGE CONTEXT:
               ${context}

      PRODUCT INFORMATION:
               ${state.products}

     
      CUSTOMER QUESTION:
      ${state.question}

      OUTPUT FORMAT (JSON ONLY, NO EXTRA TEXT):
     
      SINGLE MESSAGE TYPE TEXT EXAMPLE:
      {
        "messages": [
        {
          "text": "Jawaban ramah dan natural",
          "image": null,
          "type":"text"
        }
       ]
      }
      SINGLE MESSAGE TYPE IMAGE EXAMPLE:
      {
        "messages": [
        {
          "text": "Jawaban ramah dan natural",
          "image": IMAGE_PATH,
          "type":"image"
        }
       ]
      }

      MULTIPLE MESSAGE EXAMPLE:
      {
        "messages": [
          {
            "text": "FIRST ANSWER TEXT",
            "image": null,
            "type":"text"
          },
          {
            "text": "SECOND ANSWER IMAGE",
            "image": "IMAGE_PATH",
            "type":"image"
          }
        ]
      }
    `;
  }
}
