import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { WebResponse } from '../model/web.model';
import { GetModelLlm, LlmApi } from '../model/llm.model';
import { LargeLanguageModel as LLM } from '@prisma/client';
import { LlmService } from './LlmService/llm.service';

@Controller('api')
export class LlmController {
  constructor(private llmService: LlmService) {}
  @Post('llm')
  @HttpCode(200)
  async addNewLLM(@Body() body: LlmApi): Promise<WebResponse<LlmApi>> {
    const data = await this.llmService.addNewLLM(body);
    return {
      data: data,
      message: 'LLM created succesfully!!',
      status: '200',
    };
  }

  @Get('llm')
  @HttpCode(200)
  async getLLM(@Query() query: GetModelLlm): Promise<WebResponse<LLM[]>> {
    const data = await this.llmService.getLLm(query);
    return {
      data: data.LLM,
      status: '200',
      pagination: data.Pagination,
    };
  }
  @Get('llm/:id')
  @HttpCode(200)
  async getLLMbyid(@Param('id') id: string): Promise<WebResponse<LLM>> {
    console.log(id);
    const data = await this.llmService.getLLmbyId(id);
    return {
      data: data,
      status: '200',
    };
  }

  @Patch('llm/:id')
  @HttpCode(200)
  async editLLM(
    @Body() body: LlmApi,
    @Param('id') id: string,
  ): Promise<WebResponse<LlmApi>> {
    const data = await this.llmService.editLlm({ ...body, id: Number(id) });
    return {
      data: data,
      message: 'LLM updated succesfully!!',
      status: '200',
    };
  }
  @Delete('llm/:id')
  @HttpCode(200)
  async deleteLLM(@Param('id') id: string): Promise<WebResponse<LlmApi>> {
    await this.llmService.deleteLlm(id);
    return {
      message: 'LLM deleted succesfully!!',
      status: '200',
    };
  }
}
