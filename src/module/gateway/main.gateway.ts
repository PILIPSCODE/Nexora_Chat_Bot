import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import * as cookie from 'cookie';
import { JwtService } from '../auth/service/jwt.service';
import { PrismaService } from '../prisma/service/prisma.service';
import { startBot } from 'src/model/bot.model';
import { IntegrationSocket } from './service/IntegrationSocket';
import { forwardRef, Inject, OnModuleInit } from '@nestjs/common';
import { ConversationSocket } from './service/conversationSocket';
import { userAgentSocket } from './service/userAgentSocket';
import { TestAgent } from 'src/model/userAgent.model';
import { JoinRoom, SendMessage } from 'src/model/conversation.model';
import { GatewayEventService } from './gatewayEventEmiter';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class MainGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private prismaService: PrismaService,
    private gatewayEventService: GatewayEventService,
    private integrationSocket: IntegrationSocket,
    private conversationSocket: ConversationSocket,
    private userAgentSocket: userAgentSocket,
  ) {}

  onModuleInit() {
    this.gatewayEventService.registerEmitter((room, event, payload) => {
      this.server.to(room).emit(event, payload);
    });
  }

  async handleConnection(client: Socket) {
    try {
      const cookieHeader = client.handshake.headers.cookie;
      if (!cookieHeader) {
        client.disconnect();
        return;
      }

      const cookies = cookie.parse(cookieHeader);
      const token = cookies['access_token'];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verificationToken(token);

      if (!payload) client.disconnect();

      console.log(`Socket ${client.id} connected `);
    } catch (error) {
      console.log(error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Socket ${client.id} disconnected`);
    // console.log(client.listenerCount('disconnect'));
    client.disconnect();
  }

  emitAgentStatus(userId: string, payload: any) {
    this.server.to(`user:${userId}`).emit('agent-status', payload);
  }

  // Integration Socket

  @SubscribeMessage('startBot')
  async startBot(
    @ConnectedSocket() client: Socket,
    @MessageBody() req: startBot,
  ) {
    const roomJoin = `bot:${req.botId}`;
    client.join(roomJoin);
    await this.integrationSocket.startBot(req, roomJoin);
  }

  @SubscribeMessage('disableBot')
  async disableBot(
    @ConnectedSocket() client: Socket,
    @MessageBody() req: startBot,
  ) {
    const roomJoin = `bot:${req.botId}`;
    console.log(req.botId);
    client.join(roomJoin);
    await this.integrationSocket.disableBot(req, roomJoin);
  }

  // UserAgent Socket
  @SubscribeMessage('testAgent')
  async testAgent(
    @ConnectedSocket() client: Socket,
    @MessageBody() req: TestAgent,
  ) {
    const roomJoin = `agent:${req.agentId}`;
    client.join(roomJoin);

    await this.userAgentSocket.testAgent(req, roomJoin);
  }

  // Conversation Socket

  @SubscribeMessage('conversationStart')
  async conversationStart(client: Socket, req: JoinRoom) {
    client.join(`room:${req.room}`);
  }
  @SubscribeMessage('conversationEnd')
  async conversationEnd(client: Socket, req: JoinRoom) {
    client.leave(`room:${req.room}`);
  }
  @SubscribeMessage('sendMessage')
  async sendMessage(client: Socket, req: SendMessage) {
    const roomJoin = `room:${req.room}`;
    client.join(roomJoin);
    await this.conversationSocket.sendMessage(req, roomJoin);
  }
}
