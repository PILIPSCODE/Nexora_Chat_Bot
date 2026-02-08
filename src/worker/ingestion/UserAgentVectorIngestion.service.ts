import { HttpException, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from 'src/module/prisma/service/prisma.service';
import { VectorStoreService } from 'src/module/vector/service/vectoreStore.service';
import { UserAgentEventPublisher } from '../redisPublisher/userAgentEventPublisher';
import { SupabaseStoreService } from 'src/module/vector/service/supabaseStore.service';
import { PostgreStoreService } from 'src/module/vector/service/postgreStore.service';

@Injectable()
export class UserAgentVectorIngestionService {
  constructor(
    private readonly vectorStore: PostgreStoreService, // VectorStoreService,SupabaseStoreService
    private readonly prismaService: PrismaService,
    private userAgentEventPublisher: UserAgentEventPublisher,
  ) {}

  async ingestAgent(job: Job) {
    const { userAgentId, userId, filePath, productIds } = job.data;
    try {
      const products = await this.prismaService.product.findMany({
        where: { id: { in: productIds } },
        include: {
          variantOptions: {
            include: {
              values: true,
            },
          },
          productVariants: {
            include: {
              values: {
                include: {
                  value: true,
                },
              },
            },
          },
        },
      });

      if (products.length !== productIds.length) {
        throw new HttpException('Some products not found', 400);
      }

      await this.vectorStore.storeVectorProduct(products, userAgentId, userId);

      await this.vectorStore.storeVectorFile(filePath, userAgentId, userId);

      await this.prismaService.userAgent.update({
        where: { id: userAgentId },
        data: { vectoreStatus: 'READY' },
      });
      await this.userAgentEventPublisher.agentReady(userId, userAgentId);
    } catch (error) {
      await this.prismaService.userAgent.update({
        where: { id: userAgentId },
        data: { vectoreStatus: 'FAILED' },
      });
      await this.userAgentEventPublisher.agentFailed(userId, userAgentId);
      throw error;
    }
  }

  async DegestAgent(job: Job) {
    const {
      userAgentId,
      userId,
      filePath,
      productIds,
      isFileSame,
      isProductSame,
    } = job.data;
    try {
      await this.deleteAllVectorByUserOrPrompt(userId, userAgentId);

      if (productIds.length !== 0 || filePath) {
        if (!isProductSame) {
          const products = await this.prismaService.product.findMany({
            where: { id: { in: productIds } },
            include: {
              variantOptions: {
                include: {
                  values: true,
                },
              },
              productVariants: {
                include: {
                  values: {
                    include: {
                      value: true,
                    },
                  },
                },
              },
            },
          });

          if (products.length !== productIds.length) {
            throw new HttpException('Some products not found', 400);
          }

          await this.vectorStore.storeVectorProduct(
            products,
            userAgentId,
            userId,
          );
        }

        if (!isFileSame) {
          await this.vectorStore.storeVectorFile(filePath, userAgentId, userId);
        }

        await this.userAgentEventPublisher.agentReady(userId, userAgentId);

        await this.prismaService.userAgent.update({
          where: { id: userAgentId },
          data: { vectoreStatus: 'READY' },
        });
      }
    } catch (error) {
      await this.userAgentEventPublisher.agentFailed(userId, userAgentId);

      await this.prismaService.userAgent.update({
        where: { id: userAgentId },
        data: { vectoreStatus: 'FAILED' },
      });
      throw error;
    }
  }

  async deleteAllVectorByUserOrPrompt(userId: string, userAgentId: string) {
    await this.vectorStore.deleteByFilter('AgentUserDocument', {
      must: [
        { key: 'userId', match: { value: userId } },
        { key: 'agentId', match: { value: userAgentId } },
      ],
    });

    await this.vectorStore.deleteByFilter('AgentUserProduct', {
      must: [
        { key: 'userId', match: { value: userId } },
        { key: 'agentId', match: { value: userAgentId } },
      ],
    });
  }
}
