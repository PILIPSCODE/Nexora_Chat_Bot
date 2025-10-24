import { PrismaService } from 'src/module/common/prisma.service';
import { GoogleOauth } from 'src/module/model/user.model';
import { JwtService } from './jwt.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(detailUsers: GoogleOauth) {
    const user = await this.prismaService.account.findFirst({
      where: {
        provider: 'google',
        providerAccountId: detailUsers.id,
      },
    });
    const refreshToken = this.jwtService.generateRefreshToken(detailUsers.id);

    if (user) {
      await this.jwtService.generateAccessToken(String(user.refreshToken));
      return user;
    }
    const newUser = await this.prismaService.user.create({
      data: {
        firstName: detailUsers.firstName,
        lastName: detailUsers.lastName,
        email: detailUsers.email,
        picture: detailUsers.picture,
      },
    });

    const newAccount = await this.prismaService.account.create({
      data: {
        userId: newUser.id,
        providerAccountId: detailUsers.id,
        provider: detailUsers.provider,
        refreshToken: refreshToken,
        token_type: 'uuid',
        scope: String(detailUsers.scope),
      },
    });
    await this.jwtService.generateAccessToken(String(refreshToken));
    return newAccount;
  }
}
