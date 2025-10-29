import { HttpException, Injectable } from '@nestjs/common';
import { FacebookApiService } from './facebookApi.service';
import { PostMessage, WabaHook } from 'src/module/model/waba.model';
import { ValidationService } from 'src/module/common/validation.service';
import { IntegrationsValidation } from '../dto/Integration.validation';
import { PrismaService } from 'src/module/common/prisma.service';
import { GroqService } from 'src/module/llm/LlmService/groq.service';

@Injectable()
export class wabaService {
  constructor(
    private facebookApiService: FacebookApiService,
    private validationService: ValidationService,
    private prismaService: PrismaService,
    private groqService: GroqService,
  ) {}

  async sendMessage(req: WabaHook) {
    const HookValid: WabaHook = this.validationService.validate(
      IntegrationsValidation.WabaHook,
      req,
    );

    if (!HookValid) throw new HttpException('Validation Error', 400);

    const findWabaAccount =
      await this.prismaService.whatsaapBussinessAccount.findFirst({
        where: {
          businessId: HookValid.wabaId,
        },
      });

    if (!findWabaAccount) throw new HttpException('Unauthorized', 400);

    // Find Bot settings

    const aiResponse = await this.groqService.createCompletions(req.text);

    // Generate by LLM Type Message return Json
    const data: PostMessage = {
      type: 'text',
      message: String(aiResponse),
      numberPhoneId: req.numberPhoneId,
      to: HookValid.from,
    };
    this.facebookApiService.PostMessage(data);
  }
}
