import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/module/prisma/service/prisma.service';
import { ValidationService } from 'src/module/common/other/validation.service';
import {
  changeUserAgent,
  GetModelUserAgent,
  PaginationResponseUserAgent,
  postUserAgent,
  UserAgentApi,
  UserAgentResponseById,
} from 'src/model/userAgent.model';
import { UserAgentValidation } from '../dto/userAgent.validation';
import { moveFile } from 'src/interceptors/multer.interceptors';
import { LlmService } from 'src/module/llm/LlmService/llm.service';
import { CryptoService } from 'src/module/common/other/crypto.service';
import { promises as fs } from 'fs';
import { vectorIngestQueue } from 'src/module/Queue/service/vector.queue';
import { UserAgentRateLimiter } from '../userAgent.ratelimiter';

@Injectable()
export class UserAgentService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private llmService: LlmService,
    private cryptoService: CryptoService,
    private userAgentRateLimiter: UserAgentRateLimiter,
  ) {}

  async getUserAgentByUserId(
    query: GetModelUserAgent,
  ): Promise<PaginationResponseUserAgent> {
    const UserAgentValid: GetModelUserAgent = this.validationService.validate(
      UserAgentValidation.Pagination,
      query,
    );
    if (!UserAgentValid) throw new HttpException('Validation Error', 400);
    const { page, limit, userId } = UserAgentValid;
    if (query.userId == '' || !query.userId)
      throw new HttpException('Validation Error', 400);

    const data = await this.prismaService.userAgent.findMany({
      where: {
        userId: query.userId,
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });

    const totalData = await this.prismaService.userAgent.count({
      where: {
        userId: query.userId,
      },
    });

    return {
      UserAgent: data,
      Pagination: {
        page: Number(page),
        pageSize: Number(limit),
        totalItems: totalData,
        totalPages: totalData / Number(limit),
      },
    };
  }
  async getUserAgent(
    query: GetModelUserAgent,
  ): Promise<PaginationResponseUserAgent> {
    const UserAgentValid: GetModelUserAgent = this.validationService.validate(
      UserAgentValidation.Pagination,
      query,
    );
    if (!UserAgentValid) throw new HttpException('Validation Error', 400);
    const { page, limit } = UserAgentValid;

    const data = await this.prismaService.userAgent.findMany({
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });
    const totalData = await this.prismaService.userAgent.count();

    return {
      UserAgent: data,
      Pagination: {
        page: Number(page),
        pageSize: Number(limit),
        totalItems: totalData,
        totalPages: totalData / Number(limit),
      },
    };
  }

  async getUserAgentbyId(id: string): Promise<UserAgentResponseById> {
    try {
      if (!id) throw new HttpException('Validation Error', 400);

      const data = await this.prismaService.userAgent.findFirst({
        where: {
          id: id,
        },
      });

      if (!data) throw new HttpException('Cannot Find Agent', 403);

      return data;
    } catch (error) {
      throw new HttpException('AgentId is Invalid', 400);
    }
  }

  async addNewUserAgent(req: postUserAgent): Promise<UserAgentApi> {
    const UserAgentValid: postUserAgent = this.validationService.validate(
      UserAgentValidation.UserAgent,
      req,
    );

    if (!UserAgentValid) throw new HttpException('Validation Error', 400);
    await this.userAgentRateLimiter.check(UserAgentValid.userId);

    const replacePath = UserAgentValid.filePath.replace('file', 'temp');

    const ValidPath = await fs
      .access(replacePath)
      .then(() => true)
      .catch(() => false);

    if (!ValidPath) throw new HttpException('File Tidak Ditemukan', 400);

    const data = await this.prismaService.userAgent.create({
      data: UserAgentValid,
    });

    if (data) {
      await moveFile(replacePath, 'file');
    }

    await vectorIngestQueue.add(
      'INGEST_AGENT',
      {
        userAgentId: data.id,
        userId: UserAgentValid.userId,
        filePath: data.filePath,
        prompt: UserAgentValid.prompt,
        productIds: data.productIds,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );

    const res: UserAgentApi = {
      name: data.name,
      filePath: data.filePath,
      prompt: data.prompt,
      agent: data.agent,
      vectorStatus: 'Processing',
    };

    return res;
  }

  async editUserAgent(req: changeUserAgent) {
    try {
      const UserAgentValid: changeUserAgent = this.validationService.validate(
        UserAgentValidation.chageUserAgent,
        req,
      );

      if (!UserAgentValid) throw new HttpException('Validation Error', 400);
      await this.userAgentRateLimiter.check(UserAgentValid.userId);

      const replacePath = UserAgentValid.filePath.replace('file', 'temp');

      const find = await this.getUserAgentbyId(req.id);

      const data = await this.prismaService.userAgent.update({
        where: {
          id: req.id,
        },
        data: UserAgentValid,
      });

      const isFileSame = find.filePath === data.filePath;
      const isProductSame =
        JSON.stringify(find.productIds) === JSON.stringify(data.productIds);

      if (!isFileSame) {
        await moveFile(replacePath, 'file');
        await moveFile(find.filePath, 'temp');
      }
      await vectorIngestQueue.add(
        'DEGEST_AGENT',
        {
          userAgentId: data.id,
          userId: UserAgentValid.userId,
          filePath: data.filePath,
          productIds: data.productIds,
          isFileSame: isFileSame,
          isProductSame: isProductSame,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        },
      );

      const res: UserAgentApi = {
        name: data.name,
        agent: data.agent,
        filePath: data.filePath,
        prompt: data.prompt,
        vectorStatus:
          find.filePath === data.filePath ? data.vectoreStatus : 'Processing',
      };
      return res;
    } catch (error) {
      if (error.response === 'File Tidak Ditemukan')
        throw new HttpException('File Tidak Ditemukan', 400);
      if (error.response === 'Too many agents created, please wait 5 minute')
        throw new HttpException(
          'Too many agents created, please wait 5 minute',
          400,
        );

      if (String(error).includes('invalid_type')) throw error;
      throw new HttpException('AgentId is Invalid', 400);
    }
  }
  async deleteUserAgent(id: string) {
    if (!id) throw new HttpException('Validation Error', 400);

    try {
      const data = await this.prismaService.userAgent.delete({
        where: {
          id: id,
        },
      });

      if (data) {
        await moveFile(String(data.filePath), 'temp');

        await vectorIngestQueue.add(
          'DEGEST_AGENT',
          {
            userAgentId: data.id,
            userId: data.userId,
            filePath: null,
            productIds: [],
          },
          {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
          },
        );
      }

      return true;
    } catch (error) {
      throw new HttpException('AgentId is Invalid', 400);
    }
  }
}
