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
import { changePrompt, postPrompt, PromptApi } from '../model/prompt.model';

@Controller('api')
export class PromptController {
  constructor(private promptService: PromptService) {}
  @Post('prompt')
  @HttpCode(200)
  async addNewPrompt(@Body() body: postPrompt) {
    const data = await this.promptService.addNewPrompt(body);
    return {
      data: data,
      message: 'Prompt created succesfully!!',
      status: '200',
    };
  }

  @Get('prompt')
  @HttpCode(200)
  async getPrompt() {
    const data = await this.promptService.getPrompt();
    return {
      data: data,
      status: '200',
    };
  }
  @Get('prompt/:id')
  @HttpCode(200)
  async getPromptbyid(@Param('id') id: string) {
    const data = await this.promptService.getPromptbyId(id);
    return {
      data: data,
      status: '200',
    };
  }

  @Patch('prompt/:id')
  @HttpCode(200)
  async editPrompt(@Body() body: PromptApi, @Param('id') id: string) {
    const data = await this.promptService.editPrompt({ ...body, id: id });
    return {
      data: data,
      message: 'Prompt updated succesfully!!',
      status: '200',
    };
  }
  @Delete('prompt/:id')
  @HttpCode(200)
  async deletePrompt(@Param('id') id: string) {
    await this.promptService.deletePrompt(id);
    return {
      message: 'Prompt deleted succesfully!!',
      status: '200',
    };
  }
}
