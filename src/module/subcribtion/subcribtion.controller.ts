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
import { SubcribtionApi, ChangeSubcribtion } from 'src/model/subcribtion.model';
import { WebResponse } from 'src/model/web.model';
import { Subscribtion } from '@prisma/client';
import { SubscribtionService } from './service/subcribtion.service';

@Controller('api')
export class SubscribtionController {
  constructor(private subcribtionService: SubscribtionService) {}
  @Post('/admin/subscribtion')
  @HttpCode(200)
  async addNewSubcribtion(
    @Body() body: SubcribtionApi,
  ): Promise<WebResponse<SubcribtionApi>> {
    const data = await this.subcribtionService.addNewSubscribtion(body);
    return {
      data: data,
      message: 'Subscribtion created succesfully!!',
      status: '200',
    };
  }

  @Get('/subscribtion')
  @HttpCode(200)
  async getSubcribtion(): Promise<WebResponse<SubcribtionApi[]>> {
    const data = await this.subcribtionService.getAllSubscribtion();
    return {
      data: data,
      status: '200',
    };
  }
  @Get('/subscribtion/:id')
  @HttpCode(200)
  async getSubcribtionbyid(
    @Param('id') id: string,
  ): Promise<WebResponse<SubcribtionApi>> {
    const data = await this.subcribtionService.getSubscribtionbyId(Number(id));
    return {
      data: data,
      status: '200',
    };
  }

  @Patch('/admin/subscribtion/:id')
  @HttpCode(200)
  async editSubcribtion(
    @Body() body: ChangeSubcribtion,
    @Param('id') id: string,
  ): Promise<WebResponse<SubcribtionApi>> {
    const data = await this.subcribtionService.editSubscribtion({
      ...body,
      id: id,
    });
    return {
      data: data,
      message: 'Subscribtion updated succesfully!!',
      status: '200',
    };
  }
  @Delete('/admin/subscribtion/:id')
  @HttpCode(200)
  async deleteSubcribtion(
    @Param('id') id: string,
  ): Promise<WebResponse<SubcribtionApi>> {
    await this.subcribtionService.deleteSubscribtion(Number(id));
    return {
      message: 'Subscribtion deleted succesfully!!',
      status: '200',
    };
  }
}
