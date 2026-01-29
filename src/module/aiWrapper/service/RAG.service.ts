import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserAgent } from '@prisma/client';
import { LLMPlatform, RAGState } from 'src/model/Rag.model';
import { XenovaEmbeddings } from 'src/module/embedding/service/xenovaEmbbeding.service';
import { VectorStoreService } from 'src/module/vector/service/vectoreStore.service';
import { ChatMemoryRedisService } from '../ChatMemoryRedis.service';
import { OpenAiEmbbedingService } from 'src/module/embedding/service/openAIEmbedding.service';
import { CustomerServiceWorkFlow } from '../Workflow/customerService.workflow';
import { ChoosenLLmService } from './ChoosenLLm.service';
import { SupabaseStoreService } from 'src/module/vector/service/supabaseStore.service';
import { UserSubscribtionService } from 'src/module/userSubcribtion/service/userSubcribtion.service';

@Injectable()
export class RAGService {
  constructor(
    private readonly vectorStoreService: SupabaseStoreService, // VectorStoreService,
    private readonly embeddingService: XenovaEmbeddings,
    private userSubcribtionService: UserSubscribtionService,
    private readonly choosenLLmService: ChoosenLLmService,
    private readonly openAIEmbeddingService: OpenAiEmbbedingService,
    private memorizeService: ChatMemoryRedisService,
    @Inject(forwardRef(() => CustomerServiceWorkFlow))
    private customerServiceWorkflow: CustomerServiceWorkFlow,
  ) {}

  async classifyTools(
    state: RAGState,
    category: string,
    agent: UserAgent,
    from?: string | null,
  ) {
    const prompt = `

    Classify the customer question into one category name:
    ${category}

    Question: ${state.question}

    Answer ONLY CATEGORY NAME ABOVE
    `;

    const llm = await this.choosenLLmService.chooseLLM(
      'groq',
      'llama-3.3-70b-versatile',
      process.env.GROQ_API_KEY || '',
    );

    const res = await llm?.invoke(prompt);
    if (res) {
      const token = res.usage_metadata?.total_tokens;
      await this.userSubcribtionService.updateToken(
        agent.userId,
        BigInt(Number(token)),
      );
      state.tokenUsage += Number(token);
    }

    return res?.content;
  }

  async Retrieve(state: RAGState, agent: UserAgent) {
    const last2hist = state.chatHistory
      .slice(-2)
      .map((h) => h.content)
      .join(' ');

    const embedding = await this.openAIEmbeddingService.embedQuery(
      `${state.question}\n${last2hist}`,
    );

    if (!embedding) return;

    const baseFilter = {
      must: [{ key: 'userId', match: { value: agent.userId } }],
    };

    const collection = 'AgentUserDocument';

    const results = await this.vectorStoreService.similaritySearch(
      embedding,
      collection,
      baseFilter,
      3,
    );

    if (results)
      return {
        documents: results.map((r) => r.content ?? r.payload?.text),
      };
  }

  async Generate(state: RAGState, agent: UserAgent, llm: LLMPlatform) {
    const history = this.memorizeService.trimHistory(state.chatHistory ?? []);
    const memory = this.memorizeService.formatChatHistory(history);

    const prompt = this.customerServiceWorkflow.customerServicePrompt(
      agent?.prompt,
      memory,
      state,
    );

    const completion = await llm.invoke(prompt);
    if (completion) {
      const token = completion.usage_metadata?.total_tokens;
      await this.userSubcribtionService.updateToken(
        agent.userId,
        BigInt(Number(token)),
      );
      state.tokenUsage += Number(token);
    }

    return {
      answer: completion.content,
      chatHistory: [{ role: 'assistant', content: completion.content }],
    };
  }
}
