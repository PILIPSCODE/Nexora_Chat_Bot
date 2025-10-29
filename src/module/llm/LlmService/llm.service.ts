import { ValidationService } from 'src/module/common/validation.service';
import { changeLlm, LlmApi } from 'src/module/model/llm.model';
import { LLmValidation } from '../dto/llm.validation';
import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/module/common/prisma.service';
import { LargeLanguageModel as LLM } from '@prisma/client';

@Injectable()
export class LlmService {
  constructor(
    private validationService: ValidationService,
    private prismaService: PrismaService,
  ) {}

  async getLLm(): Promise<LLM[]> {
    const data = await this.prismaService.largeLanguageModel.findMany();
    return data;
  }
  async getLLmbyId(id: string): Promise<LLM> {
    try {
      const data = await this.prismaService.largeLanguageModel.findFirst({
        where: {
          id: Number(id),
        },
      });

      if (!data) throw new HttpException('Cannot Find LLM', 403);
      return data;
    } catch (error) {
      throw new HttpException('LLmId is Invalid', 400);
    }
  }

  async addNewLLM(req: LlmApi): Promise<LlmApi> {
    const LlmValid: LlmApi = this.validationService.validate(
      LLmValidation.LLM,
      req,
    );

    if (!LlmValid) throw new HttpException('Validation Error', 400);

    const data = await this.prismaService.largeLanguageModel.create({
      data: LlmValid,
    });

    const res = {
      name: data.name,
      version: String(data.version),
    };

    return res;
  }

  async editLlm(req: changeLlm): Promise<LlmApi> {
    try {
      const LlmValid: LlmApi = this.validationService.validate(
        LLmValidation.chageLLM,
        req,
      );

      const data = await this.prismaService.largeLanguageModel.update({
        where: {
          id: Number(req.id),
        },
        data: LlmValid,
      });

      const res = {
        name: data.name,
        version: String(data.version),
      };

      return res;
    } catch (error) {
      if (String(error).includes('invalid_type')) throw error;
      throw new HttpException('LLmId is Invalid', 400);
    }
  }
  async deleteLlm(id: string): Promise<Boolean> {
    try {
      await this.prismaService.largeLanguageModel.delete({
        where: {
          id: Number(id),
        },
      });

      return true;
    } catch (error) {
      throw new HttpException('LLmId is Invalid', 400);
    }
  }
}
