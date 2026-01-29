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
import { WebResponse } from 'src/model/web.model';
import { UserSubcribtion } from '@prisma/client';
import { UserSubscribtionService } from './service/userSubcribtion.service';
import {
  ChangeUserSubcribtion,
  UserSubcribtionApi,
} from 'src/model/userSubcribtion.model';

@Controller('api')
export class UserSubscribtionController {
  constructor(private subcribtionService: UserSubscribtionService) {}
  @Post('/userSubscribtion')
  @HttpCode(200)
  async addNewSubcribtion(
    @Body() body: UserSubcribtionApi,
  ): Promise<WebResponse<UserSubcribtionApi>> {
    const data = await this.subcribtionService.addNewUserSubscribtion(body);
    return {
      data: data,
      message: 'UserSubscribtion created succesfully!!',
      status: '200',
    };
  }

  @Get('/userSubscribtion')
  @HttpCode(200)
  async getSubcribtion(): Promise<WebResponse<UserSubcribtion[]>> {
    const data = await this.subcribtionService.getAllUserSubscribtion();
    return {
      data: data,
      status: '200',
    };
  }
  @Get('/userSubscribtion/:id')
  @HttpCode(200)
  async getSubcribtionbyid(
    @Param('id') id: string,
  ): Promise<WebResponse<UserSubcribtion>> {
    const data = await this.subcribtionService.getUserSubscribtionbyId(id);
    return {
      data: data,
      status: '200',
    };
  }

  @Patch('/admin/userSubscribtion/:id')
  @HttpCode(200)
  async editSubcribtion(
    @Body() body: ChangeUserSubcribtion,
    @Param('id') id: string,
  ): Promise<WebResponse<UserSubcribtionApi>> {
    const data = await this.subcribtionService.editUserSubscribtion({
      ...body,
      id: id,
    });
    return {
      data: data,
      message: 'UserSubscribtion updated succesfully!!',
      status: '200',
    };
  }
  @Delete('/admin/userSubscribtion/:id')
  @HttpCode(200)
  async deleteSubcribtion(
    @Param('id') id: string,
  ): Promise<WebResponse<UserSubcribtionApi>> {
    await this.subcribtionService.deleteUserSubscribtion(id);
    return {
      message: 'UserSubscribtion deleted succesfully!!',
      status: '200',
    };
  }
}
