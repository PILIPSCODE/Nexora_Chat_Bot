import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { WebResponse } from 'src/model/web.model';
import { UserService } from './service/user.service';
import { GetCurrentUser } from 'src/model/user.model';

@Controller('api')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('user')
  @HttpCode(200)
  async getCurrentUser(@Req() request: Request, @Res() response: Response) {
    const accessToken = request.cookies.access_token;
    const data = await this.userService.getCurrentUser(String(accessToken));

    response.status(200).json({
      data: data,
      status: '200',
      message: 'Successfuly get current user!!',
    });
  }

  @Patch('user/:id')
  @HttpCode(200)
  async updateUser(
    @Param('id') userId,
    @Body() body,
  ): Promise<WebResponse<GetCurrentUser>> {
    const data = await this.userService.updateUser({
      ...body,
      id: userId,
    });
    return {
      data: data,
      status: '200',
      message: 'User updated successfuly!!',
    };
  }

  @Post('user/forgotPassword')
  @HttpCode(200)
  async updatePassword(@Body() body) {
    await this.userService.updateUserPassword(body);
    return {
      status: '200',
      message: 'Password updated successfuly!!',
    };
  }
  @Post('user/sendOtp')
  @HttpCode(200)
  async sendOtp(@Body() body) {
    await this.userService.sendOtp(body);
    return {
      status: '200',
      message: 'Verification Send!!',
    };
  }

  @Post('user/changePassword')
  @HttpCode(200)
  async changePassword(@Body() body) {
    await this.userService.changeUserPassword(body);
    return {
      status: '200',
      message: 'Password updated successfuly!!',
    };
  }

  @HttpCode(200)
  @Delete('admin/user/:id')
  async deleteUser(@Param('id') userId): Promise<WebResponse<boolean>> {
    await this.userService.deleteUser(userId);
    return {
      data: true,
      message: 'User deleted successfuly',
      status: '200',
    };
  }
}
