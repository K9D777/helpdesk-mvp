import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173'],
  },
})
export class TicketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Conectado ao painel: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Desconectado do painel: ${client.id}`);
  }

  emitNewTicket(ticket: any) {
    this.server.emit('ticket:new', ticket);
  }

  emitTicketUpdated(ticket: any) {
    this.server.emit('ticket:updated', ticket);
  }

  emitDashboardUpdate(payload: any) {
    this.server.emit('dashboard:update', payload);
  }
}
