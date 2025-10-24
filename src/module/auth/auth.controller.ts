import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CredentialStrategy } from './strategies/credential.strategy';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UserResponse,
  VerificationRequest,
} from 'src/module/model/user.model';
import { WebResponse } from 'src/module/model/web.model';
import { CookieInterceptor } from 'src/interceptors/cookies.interceptors';
import type { Request, Response } from 'express';
import { JwtService } from './service/jwt.service';
import { PrismaService } from 'src/module/common/prisma.service';
import { GoogleOauthGuard } from './guard/google-oauth.guard';

@Controller('/api/auth')
export class AuthController {
  constructor(
    private creadentialStrategy: CredentialStrategy,
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  @Post('register')
  @HttpCode(200)
  async register(
    @Body() request: RegisterUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.creadentialStrategy.register(request);
    return {
      data: result,
      message: 'Registration successfuly',
      status: '200',
    };
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() request: LoginUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.creadentialStrategy.login(request);
    return {
      data: result,
      message:
        'Login successfuly. Please check your email to verify your account',
      status: '200',
    };
  }

  @Post('otp-verification')
  @HttpCode(200)
  @UseInterceptors(CookieInterceptor)
  async otpVerification(
    @Body() request: VerificationRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.creadentialStrategy.VerificationOTP(request);
    return {
      data: result,
      message: 'Success Verfied Code!!',
      status: '200',
    };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.headers['authorization'];

    const accessToken = await this.creadentialStrategy.refreshAccessToken(
      String(refreshToken),
    );

    res
      .status(200)
      .cookie('access_token', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      })
      .json({ message: 'accessToken refeshed!!', status: '200' });
  }

  @Get('google/login')
  @HttpCode(200)
  @UseGuards(GoogleOauthGuard)
  handlelogin() {
    return {
      message: 'Google Authentication',
      status: 200,
    };
  }

  @Get('google/redirect')
  @HttpCode(200)
  @UseGuards(GoogleOauthGuard)
  async handleRedirect(@Req() req, @Res() res) {
    const response = await this.prismaService.account.findFirst({
      where: { id: req.user.id },
    });
    const token = response?.accessToken;

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    });

    // redirect ke frontend tanpa token di URL
    return res.redirect('http://localhost:3001/dashboard');
  }
}
