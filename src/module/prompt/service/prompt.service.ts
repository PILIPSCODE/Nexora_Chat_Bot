import { HttpException, Injectable } from '@nestjs/common';
import { Prompt } from '@prisma/client';
import { PrismaService } from 'src/module/common/prisma.service';
import { ValidationService } from 'src/module/common/validation.service';
import {
  changePrompt,
  postPrompt,
  PromptApi,
} from 'src/module/model/prompt.model';
import { PromptValidation } from '../dto/prompt.validation';

@Injectable()
export class PromptService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async getPrompt(): Promise<Prompt[]> {
    const data = await this.prismaService.prompt.findMany();
    return data;
  }
  async getPromptbyId(id: string): Promise<Prompt> {
    try {
      if (!id) throw new HttpException('Validation Error', 400);

      const data = await this.prismaService.prompt.findFirst({
        where: {
          id: id,
        },
      });

      if (!data) throw new HttpException('Cannot Find LLM', 403);

      return data;
    } catch (error) {
      throw new HttpException('PromptId is Invalid', 400);
    }
  }

  async addNewPrompt(req: postPrompt): Promise<PromptApi> {
    const PromptValid: postPrompt = this.validationService.validate(
      PromptValidation.Prompt,
      req,
    );

    if (!PromptValid) throw new HttpException('Validation Error', 400);

    const data = await this.prismaService.prompt.create({
      data: PromptValid,
    });

    const res: PromptApi = {
      name: data.name,
      prompt: data.prompt,
      modelName: String(data.modelName),
    };

    return res;
  }

  async editPrompt(req: changePrompt) {
    try {
      const PromptValid: PromptApi = this.validationService.validate(
        PromptValidation.chagePrompt,
        req,
      );

      if (!PromptValid) throw new HttpException('Validation Error', 400);
      const data = await this.prismaService.prompt.update({
        where: {
          id: req.id,
        },
        data: PromptValid,
      });

      const res: PromptApi = {
        name: data.name,
        prompt: data.prompt,
        modelName: String(data.modelName),
      };
      return res;
    } catch (error) {
      if (String(error).includes('invalid_type')) throw error;
      throw new HttpException('PromptId is Invalid', 400);
    }
  }
  async deletePrompt(id: string) {
    if (!id) throw new HttpException('Validation Error', 400);

    try {
      const data = await this.prismaService.prompt.delete({
        where: {
          id: id,
        },
      });
      return true;
    } catch (error) {
      throw new HttpException('PromptId is Invalid', 400);
    }
  }
}
