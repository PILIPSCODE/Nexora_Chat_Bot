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
import { ChatWebsite } from 'src/model/bot.model';
import { WebsiteService } from './website.service';

@WebSocketGateway({
  namespace: '/website-bot',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class WebisteGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private websiteService: WebsiteService) {}

  async handleConnection(client: Socket, @MessageBody() req: ChatWebsite) {
    try {
      console.log(`Socket ${client.id} connected`);
      const roomJoin = `bot:${req.botId}sid:${req.sid}`;
      client.join(roomJoin);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Socket ${client.id} disconnected`);
    client.disconnect();
  }

  emitToStrangers(room: string, event: string, payload: any) {
    this.server.to(room).emit(event, payload);
  }

  @SubscribeMessage('website-chat')
  async sendMessage(@MessageBody() req: ChatWebsite) {
    await this.websiteService.sendMessage(req, (update) => {
      const roomJoin = `bot:${req.botId}sid:${req.sid}`;
      this.emitToStrangers(roomJoin, 'stranger-chat', update);
    });
  }
}
