import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/module/common/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class JwtService {
  constructor(
    private readonly configService: ConfigService,
    private prismaService: PrismaService,
  ) {}
  generateRefreshToken(email: string) {
    const securityCode = this.configService.get<string>('SECURITY_CODE');
    if (!securityCode) {
      throw new HttpException('Internal Server Error', 500);
    }

    if (!securityCode) {
      return;
    }
    const token = jwt.sign({ email, jti: randomUUID() }, securityCode, {
      expiresIn: '7d',
    });
    return token;
  }

  async generateAccessToken(refreshToken: string): Promise<string> {
    const securityCode = this.configService.get<string>('SECURITY_CODE');

    if (!securityCode) {
      throw new HttpException('Internal Server Error', 500);
    }

    const refreshTokenValid = await this.prismaService.account.findFirst({
      where: {
        refreshToken: refreshToken,
      },
    });

    if (!refreshTokenValid) {
      throw new HttpException('Unauthorized', 401);
    }
    const token = jwt.sign({ jti: randomUUID() }, securityCode, {
      expiresIn: '15m',
    });

    await this.prismaService.account.update({
      where: {
        id: refreshTokenValid.id,
      },
      data: {
        accessToken: token,
      },
    });

    return token;
  }

  verificationToken(token: string) {
    const securityCode = this.configService.get<string>('SECURITY_CODE');

    if (!securityCode) {
      throw new HttpException('Internal Server Error', 500);
    }

    const isValid = jwt.verify(token, securityCode);
    return isValid;
  }
}
