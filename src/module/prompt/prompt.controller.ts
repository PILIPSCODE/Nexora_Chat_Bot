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
} from '@nestjs/common';
import { PromptService } from './service/prompt.service';
import {
  changePrompt,
  GetModelPrompt,
  postPrompt,
  PromptApi,
} from '../model/prompt.model';
import { WebResponse } from '../model/web.model';
import { Prompt } from '@prisma/client';

@Controller('api')
export class PromptController {
  constructor(private promptService: PromptService) {}
  @Post('prompt')
  @HttpCode(200)
  async addNewPrompt(
    @Body() body: postPrompt,
  ): Promise<WebResponse<PromptApi>> {
    const data = await this.promptService.addNewPrompt(body);
    return {
      data: data,
      message: 'Prompt created succesfully!!',
      status: '200',
    };
  }

  @Get('prompt')
  @HttpCode(200)
  async getPrompt(
    @Query() query: GetModelPrompt,
  ): Promise<WebResponse<Prompt[]>> {
    const data = await this.promptService.getPromptByUserId(query);
    return {
      data: data.Prompt,
      pagination: data.Pagination,
      status: '200',
    };
  }
  @Get('/admin/prompt')
  @HttpCode(200)
  async getPromptAdmin(
    @Query() query: GetModelPrompt,
  ): Promise<WebResponse<Prompt[]>> {
    const data = await this.promptService.getPrompt(query);
    return {
      data: data.Prompt,
      pagination: data.Pagination,
      status: '200',
    };
  }
  @Get('prompt/:id')
  @HttpCode(200)
  async getPromptbyid(@Param('id') id: string): Promise<WebResponse<Prompt>> {
    const data = await this.promptService.getPromptbyId(id);
    return {
      data: data,
      status: '200',
    };
  }

  @Patch('prompt/:id')
  @HttpCode(200)
  async editPrompt(
    @Body() body: PromptApi,
    @Param('id') id: string,
  ): Promise<WebResponse<PromptApi>> {
    const data = await this.promptService.editPrompt({ ...body, id: id });
    return {
      data: data,
      message: 'Prompt updated succesfully!!',
      status: '200',
    };
  }
  @Delete('prompt/:id')
  @HttpCode(200)
  async deletePrompt(@Param('id') id: string): Promise<WebResponse<PromptApi>> {
    await this.promptService.deletePrompt(id);
    return {
      message: 'Prompt deleted succesfully!!',
      status: '200',
    };
  }
}
