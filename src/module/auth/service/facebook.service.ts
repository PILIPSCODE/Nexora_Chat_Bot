import { PrismaService } from 'src/module/common/prisma.service';
import { FacebookOauth } from 'src/module/model/user.model';
import { JwtService } from './jwt.service';
import { HttpException, Injectable } from '@nestjs/common';
import { FacebookApiService } from 'src/module/integrations/whatsaap/facebookApi.service';
import bcrypt from 'bcrypt';

@Injectable()
export class FacebookService {
  constructor(
    private prismaService: PrismaService,
    private facebookApiService: FacebookApiService,
    private jwtService: JwtService,
  ) {}

  async validateUser(detailUsers: FacebookOauth) {
    const waba = await this.prismaService.whatsaapBussinessAccount.findFirst({
      where: {
        businessId: detailUsers.busineesId,
      },
    });

    if (waba)
      throw new HttpException(
        'Cannot connect to whatsaap bussiness account the account was connect in other account user!!',
        400,
      );

    const hassedToken = await bcrypt.hash(detailUsers.accessToken, 10);
    const newWaba = await this.prismaService.whatsaapBussinessAccount.create({
      data: {
        userId: detailUsers.userId,
        accessToken: hassedToken,
        businessId: detailUsers.wabaId,
        displayName: detailUsers.name,
        email: detailUsers.email,
        facebookId: detailUsers.facebookId,
      },
    });

    const numberPhones = await this.facebookApiService.getNumberPhoneID(
      detailUsers.accessToken,
      detailUsers.wabaId,
    );

    const phoneData = numberPhones.map((phone) => ({
      numberPhoneId: phone.id,
      whatsaapBussinessAccountId: newWaba.id,
    }));

    await this.prismaService.numberPhone.createMany({
      data: phoneData,
      skipDuplicates: true,
    });

    return newWaba;
  }

  async validateUserAccount(detailUsers: FacebookOauth) {
    const waba = await this.prismaService.whatsaapBussinessAccount.findFirst({
      where: {
        businessId: detailUsers.busineesId,
      },
    });

    const user = await this.prismaService.account.findFirst({
      where: {
        provider: 'facebook',
        providerAccountId: detailUsers.facebookId,
      },
    });

    if (waba)
      throw new HttpException(
        'Cannot login using facebook whatsaap bussiness account connceted in other account!!',
        400,
      );
    const refreshToken = this.jwtService.generateRefreshToken(
      detailUsers.facebookId,
    );

    if (user) {
      await this.jwtService.generateAccessToken(String(user.refreshToken));
      return user;
    }
    const newUser = await this.prismaService.user.create({
      data: {
        firstName: detailUsers.name,
        lastName: '',
        email: detailUsers.email || '',
        picture: detailUsers.picture,
      },
    });

    const newAccount = await this.prismaService.account.create({
      data: {
        userId: newUser.id,
        providerAccountId: detailUsers.facebookId,
        provider: 'facebook',
        refreshToken: refreshToken,
        token_type: 'uuid',
        scope: String([
          'whatsapp_business_management',
          'whatsapp_business_messaging',
          'business_management',
        ]),
      },
    });
    await this.jwtService.generateAccessToken(String(refreshToken));
    await this.validateUser({ ...detailUsers, userId: newUser.id });
    return newAccount;
  }
}
