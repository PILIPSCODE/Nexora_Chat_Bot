import { HttpException, Injectable } from '@nestjs/common';
import {
  ConnectedIntegrationPlatfrom,
  DashboardModel,
  QueryDashboard,
  RespondedMessage,
} from 'src/model/dashboard.model';
import { ValidationService } from 'src/module/common/other/validation.service';
import { PrismaService } from 'src/module/prisma/service/prisma.service';
import { DashboardValidation } from '../dto/dashboard.validation';
import { Prisma, Product, UserIntegration } from '@prisma/client';
type UserIntegrationWithContent = Prisma.UserIntegrationGetPayload<{
  include: {
    contentIntegrations: true;
  };
}>;

@Injectable()
export class DashboardService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async getDashboard(query: QueryDashboard): Promise<DashboardModel> {
    const DashboardValid: QueryDashboard = this.validationService.validate(
      DashboardValidation.Dashboard,
      query,
    );
    if (!DashboardValid) throw new HttpException('Validation Error', 400);

    const totalBotActive = await this.getBotActive(query);
    const totalAgent = await this.getBotActive(query);
    const allTimeRespondedMessage =
      await this.getAllTimeRespondedMessage(query);
    const RespondedMessage = await this.RespondedMessage(query);
    const activeProduct = await this.getProductActive(query);
    const connectedIntegrationPlatfrom =
      await this.getIntegrationPlatforConnected(query);

    return {
      totalBotActive,
      totalAgent,
      allTimeRespondedMessage,
      RespondedMessage,
      activeProduct,
      connectedIntegrationPlatfrom,
    };
  }

  async getBotActive(query: QueryDashboard): Promise<number> {
    const data = await this.prismaService.bot.count({
      where: {
        userId: query.userId,
        isActive: true,
      },
    });

    return data;
  }
  async getAgent(query: QueryDashboard): Promise<number> {
    const data = await this.prismaService.userAgent.count({
      where: {
        userId: query.userId,
      },
    });

    return data;
  }
  async getAllTimeRespondedMessage(query: QueryDashboard): Promise<number> {
    const result = await this.prismaService.$queryRaw<{ total: number }[]>`
    SELECT COUNT(*)::int as total
    FROM "Message" m
    JOIN "Conversation" c ON c.id = m."conversationId"
    JOIN "BOT" b ON b.id = c."botId"
    WHERE m.role = 'Bot'
      AND b."userId" = ${query.userId}
  `;

    return result[0]?.total ?? 0;
  }
  async RespondedMessage(query: QueryDashboard): Promise<RespondedMessage[]> {
    const data = await this.prismaService.$queryRaw<
      { date: string; total: number }[]
    >`
    SELECT
      TO_CHAR(m."createdAt", 'YYYY-MM-DD') AS date,
      COUNT(*)::int AS total
    FROM "Message" m
    JOIN "Conversation" c ON c.id = m."conversationId"
    JOIN "BOT" b ON b.id = c."botId"
    WHERE m.role = 'Bot'
      AND b."userId" = ${query.userId}
      AND m."createdAt" >= NOW() - INTERVAL '${query.rangeDate || 7} days'
    GROUP BY date
    ORDER BY date ASC
  `;

    return data;
  }
  async getProductActive(query: QueryDashboard): Promise<Product[]> {
    const data = await this.prismaService.product.findMany({
      where: {
        userId: query.userId,
        isActive: true,
      },
    });

    return data;
  }
  async getIntegrationPlatforConnected(
    query: QueryDashboard,
  ): Promise<ConnectedIntegrationPlatfrom> {
    const data = await this.prismaService.userIntegration.findMany({
      where: {
        isconnected: true,
      },
      include: { contentIntegrations: true },
    });

    return this.mapIntegrationPlatformResponse(data);
  }

  mapIntegrationPlatformResponse(
    integrations: UserIntegrationWithContent[],
  ): ConnectedIntegrationPlatfrom {
    const has = (provider: string) =>
      integrations.find((i) => i.provider === provider);

    return {
      baileys: {
        setup: true,
        isActive: !!has('baileys'),
      },
      whatsappBussiness: {
        setup: true,
        isActive: !!has('whatsapp Bussiness'),
      },
      botFather: {
        setup: !!has('botFather')?.contentIntegrations?.length,
        isActive: !!has('botFather'),
      },
      website: {
        setup: !!has('website')?.contentIntegrations?.length,
        isActive: !!has('website'),
      },
    };
  }
}
