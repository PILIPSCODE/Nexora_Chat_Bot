import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/module/common/prisma.service';
import { ValidationService } from 'src/module/common/validation.service';
import { Logger } from 'winston';
import * as bcrypt from 'bcrypt';

import {
  LoginUserRequest,
  RegisterUserRequest,
  UserResponse,
  VerificationRequest,
} from 'src/module/model/user.model';
import { UserValidation } from '../dto/user.validation';
import { JwtService } from '../service/jwt.service';
import { EmailService } from '../service/email.service';

@Injectable()
export class CredentialStrategy {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(request: RegisterUserRequest): Promise<UserResponse> {
    this.logger.info('new user Registered');
    const registerValid: RegisterUserRequest = this.validationService.validate(
      UserValidation.REGISTER,
      request,
    );

    if (!registerValid) {
      throw new HttpException('Validation Error', 400);
    }

    const checkEmail = await this.prismaService.user.findFirst({
      where: {
        email: registerValid.email,
      },
    });

    if (checkEmail) {
      throw new HttpException('Email already exists!!', 409);
    }

    registerValid.password = await bcrypt.hash(registerValid.password, 10);

    const user = await this.prismaService.user.create({
      data: registerValid,
    });

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  }
  async login(request: LoginUserRequest): Promise<UserResponse> {
    this.logger.info('user doing Login');
    const loginValid: LoginUserRequest = this.validationService.validate(
      UserValidation.LOGIN,
      request,
    );

    if (!loginValid) {
      throw new HttpException('Validation Error', 400);
    }

    const checkEmail = await this.prismaService.user.findFirst({
      where: {
        email: loginValid.email,
      },
      include: {
        authProvider: {
          where: {
            providerAccountId: loginValid.email,
          },
        },
      },
    });

    if (!checkEmail) {
      throw new HttpException('Invalid email or password', 400);
    }

    const checkPassword = await bcrypt.compare(
      loginValid.password,
      String(checkEmail.password),
    );

    if (!checkPassword) {
      throw new HttpException('Invalid email or password', 400);
    }

    const refreshToken = this.jwtService.generateRefreshToken(
      `${loginValid.email}refreshToken`,
    );

    if (refreshToken === undefined) {
      throw new HttpException('Cannot Generate Refresh token', 401);
    }

    if (checkEmail.authProvider.length === 0) {
      await this.prismaService.account.create({
        data: {
          provider: 'email',
          providerAccountId: loginValid.email,
          refreshToken: refreshToken,
          token_type: 'uuid',
          userId: checkEmail.id,
        },
      });
    } else {
      await this.prismaService.account.update({
        where: {
          id: checkEmail.authProvider[0].id,
        },
        data: {
          refreshToken: refreshToken,
        },
      });
    }
    await this.jwtService.generateAccessToken(refreshToken);

    const OTP = this.emailService.generateOtp();

    const html = this.emailService.html(OTP.codeOtp);

    this.emailService.sendEmail({
      recipients: checkEmail.email,
      subject: 'Verify your Otp code we from pilbots',
      html: html,
    });

    const data = {
      firstName: checkEmail.firstName,
      lastName: checkEmail.lastName,
      email: loginValid.email,
    };

    await this.prismaService.userOtp.create({
      data: {
        otpCode: OTP.codeOtp,
        isUsed: false,
        userId: checkEmail.id,
        expiresAt: OTP.expiredAt,
      },
    });

    return data;
  }

  async VerificationOTP(request: VerificationRequest): Promise<UserResponse> {
    this.logger.info('user doing verification');
    const OTPValid: VerificationRequest = this.validationService.validate(
      UserValidation.OTP,
      request,
    );

    if (!OTPValid) {
      throw new HttpException('Validation Error', 400);
    }

    const findOTP = await this.prismaService.user.findFirst({
      where: {
        email: OTPValid.email,
      },
      include: {
        userOtp: {
          where: {
            isUsed: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        authProvider: {
          where: {
            providerAccountId: OTPValid.email,
          },
        },
      },
    });

    const OTP = findOTP?.userOtp[0];
    const AuthProvider = findOTP?.authProvider[0];

    if (!OTP || !AuthProvider) {
      console.log('OTP', OTP);
      console.log('AUth', AuthProvider);
      throw new HttpException('Internal Server Error!!', 500);
    }

    if (OTP?.expiresAt < new Date()) {
      await this.prismaService.userOtp.delete({ where: { id: OTP?.id } });
      throw new HttpException('OTP code is expired!!', 400);
    }

    if (OTP?.otpCode !== request.codeOTP) {
      throw new HttpException('Invalid OTP code!!', 400);
    }

    await this.prismaService.userOtp.update({
      where: {
        id: OTP.id,
      },
      data: {
        isUsed: true,
      },
    });

    return {
      email: findOTP.email,
      firstName: findOTP.firstName,
      lastName: findOTP.lastName,
      accessToken: AuthProvider?.accessToken || undefined,
      refreshToken: AuthProvider?.refreshToken || undefined,
    };
  }
  async refreshAccessToken(refreshToken: string) {
    if (!refreshToken)
      throw new HttpException('refreshToken is expired!!', 400);
    const isValid = this.jwtService.verificationToken(String(refreshToken));
    if (!isValid) throw new HttpException('refreshToken is invalid!!', 400);

    const accessToken = await this.jwtService.generateAccessToken(
      String(refreshToken),
    );

    return accessToken;
  }
}
