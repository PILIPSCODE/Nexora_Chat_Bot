import { HttpException, Injectable } from '@nestjs/common';
import { ContentIntegration, Prisma } from '@prisma/client';
import {
  ChangeContentIntegration,
  ContentIntegrationApi,
  ContentIntegrationConfig,
  PostContentIntegration,
  toPrismaJson,
} from 'src/model/contentIntegrations.model';
import { PrismaService } from 'src/module/prisma/service/prisma.service';
import { ValidationService } from 'src/module/common/other/validation.service';
import { ContentIntegrationValidation } from '../dto/contentIntegration.validation';
import { CryptoService } from 'src/module/common/other/crypto.service';

type ContentIntegrationResponse = Omit<ContentIntegration, 'configJson'> & {
  configJson: ContentIntegrationConfig;
};

@Injectable()
export class ContentIntegrationService {
  constructor(
    private prismaService: PrismaService,
    private cryptoService: CryptoService,
    private validationService: ValidationService,
  ) {}

  async getContentIntegrationByuserIntegrationId(
    query,
  ): Promise<ContentIntegration[]> {
    const { userIntegrationId } = query;
    if (userIntegrationId) throw new HttpException('Validation Error', 400);

    const data = await this.prismaService.contentIntegration.findMany({
      where: {
        userIntegrationId: userIntegrationId,
      },
    });
    return data;
  }

  async getContentIntegrationbyId(
    id: string,
  ): Promise<ContentIntegrationResponse> {
    try {
      if (!id) throw new HttpException('Validation Error', 400);

      const data = await this.prismaService.contentIntegration.findFirst({
        where: {
          id: id,
        },
      });

      if (!data) throw new HttpException('Cannot Find ContentIntegration', 403);
      const narrowing = await this.decryptConfig(data.configJson);

      return { ...data, configJson: narrowing };
    } catch (error) {
      throw new HttpException('ContentIntegrationId is Invalid', 400);
    }
  }

  async addNewContentIntegration(
    req: PostContentIntegration<ContentIntegrationConfig>,
  ): Promise<ContentIntegrationApi<Prisma.JsonValue>> {
    const ContentIntegrationValid: PostContentIntegration<ContentIntegrationConfig> =
      this.validationService.validate(
        ContentIntegrationValidation.ContentIntegration,
        req,
      );

    if (!ContentIntegrationValid)
      throw new HttpException('Validation Error', 400);

    const narrowing = await this.encryptConfig(
      ContentIntegrationValid.configJson,
    );

    const data = await this.prismaService.contentIntegration.create({
      data: {
        ...ContentIntegrationValid,
        configJson: toPrismaJson(narrowing),
      },
    });

    const result: ContentIntegrationApi<Prisma.JsonValue> = await data;

    return result;
  }

  async editContentIntegration(
    req: ChangeContentIntegration<ContentIntegrationConfig>,
  ) {
    try {
      const ContentIntegrationValid: ChangeContentIntegration<ContentIntegrationConfig> =
        this.validationService.validate(
          ContentIntegrationValidation.ChangeContentIntegration,
          req,
        );

      if (!ContentIntegrationValid)
        throw new HttpException('Validation Error', 400);

      const narrowing = await this.encryptConfig(
        ContentIntegrationValid.configJson,
      );

      const data = await this.prismaService.contentIntegration.update({
        where: {
          id: req.id,
        },
        data: {
          ...ContentIntegrationValid,
          configJson: toPrismaJson(narrowing),
        },
      });

      const result: ContentIntegrationApi<Prisma.JsonValue> = await data;
      return result;
    } catch (error) {
      if (String(error).includes('invalid_type')) throw error;
      throw new HttpException('ContentIntegrationId is Invalid', 400);
    }
  }
  async deleteContentIntegration(id: string) {
    if (!id) throw new HttpException('Validation Error', 400);

    try {
      const data = await this.prismaService.contentIntegration.delete({
        where: {
          id: id,
        },
      });
      return true;
    } catch (error) {
      throw new HttpException('ContentIntegrationId is Invalid', 400);
    }
  }

  async encryptConfig(
    config: ContentIntegrationConfig,
  ): Promise<ContentIntegrationConfig> {
    switch (config.provider) {
      case 'botFather':
        return {
          ...config,
          accessToken: this.cryptoService.encrypt(config.accessToken),
        };

      default:
        return config;
    }
  }

  async decryptConfig(
    configJson: Prisma.JsonValue,
  ): Promise<ContentIntegrationConfig> {
    const config = configJson as unknown as ContentIntegrationConfig;

    switch (config.provider) {
      case 'botFather':
        return {
          ...config,
          accessToken: this.cryptoService.decrypt(config.accessToken as any),
        };

      default:
        return config;
    }
  }
}
