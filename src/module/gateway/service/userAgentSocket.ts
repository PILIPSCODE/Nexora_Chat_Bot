import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ConversationWrapper } from 'src/model/aiWrapper.model';
import { TestAgent } from 'src/model/userAgent.model';
import { UserAgent } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { CryptoService } from 'src/module/common/other/crypto.service';
import { AiService } from 'src/module/aiWrapper/service/aiWrapper.service';
import { PrismaService } from 'src/module/prisma/service/prisma.service';
import { GatewayEventService } from '../gatewayEventEmiter';

@Injectable()
export class userAgentSocket {
  constructor(
    private gatewayEventService: GatewayEventService,
    private aiWrapperService: AiService,
    private cryptoService: CryptoService,
    private prismaService: PrismaService,
  ) {}

  async testAgent(@MessageBody() req: TestAgent, roomJoin: string) {
    const agent = await this.prismaService.userAgent.findUnique({
      where: {
        id: req.agentId,
      },
    });

    const conversation: ConversationWrapper = {
      botId: 'test-agent-123',
      humanHandle: false,
      sender: 'testing',
      integrationType: 'testBot',
      message: {
        text: req.question,
        type: 'text',
      },
      room: 'test-agent-123',
    };

    if (!agent) {
      this.gatewayEventService.emitToUser(
        roomJoin,
        'testAgent',
        'AgentId is not Found!!',
      );
      return;
    }

    const aiResponse = await this.aiWrapperService.wrapper(conversation, agent);

    if (aiResponse?.messages.length !== undefined) {
      aiResponse.messages.map(async (e) => {
        this.gatewayEventService.emitToUser(roomJoin, 'testAgent', e);
      });
    }
  }
}
