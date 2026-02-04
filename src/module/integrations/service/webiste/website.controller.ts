import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { PrismaService } from 'src/module/prisma/service/prisma.service';

@Controller()
export class WebsiteController {
  constructor(private prismaService: PrismaService) {}
  @Post('/sdk/session')
  async createSession(@Body() dto) {
    const domain = new URL(dto.origin).hostname;

    const allowed = await this.prismaService.contentIntegration.findFirst({
      where: {
        AND: [
          {
            configJson: {
              path: ['provider'],
              equals: 'website',
            },
          },
          {
            configJson: {
              path: ['domain'],
              equals: domain,
            },
          },
        ],
      },
    });

    if (!allowed) throw new ForbiddenException();

    const sessionId = randomUUID();

    const token = jwt.sign(
      {
        botId: dto.botId,
        domain,
        sessionId,
      },
      process.env.SDK_SECRET || '',
      { expiresIn: '2m' },
    );

    return { token };
  }
}
