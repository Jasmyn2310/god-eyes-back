import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class VendorsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Mapa en memoria para MVP: Map<socketId, { vendorId, lat, lng }>
  private activeVendors = new Map<string, any>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.activeVendors.delete(client.id);
    this.broadcastVendors();
  }

  @SubscribeMessage('updateLocation')
  handleUpdateLocation(
    @MessageBody() data: { vendorId: string; lat: number; lng: number; isPremium: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    // Guardar o actualizar la posición del vendedor
    this.activeVendors.set(client.id, {
      vendorId: data.vendorId,
      lat: data.lat,
      lng: data.lng,
      isPremium: data.isPremium,
    });

    // Retransmitir a todos los clientes la lista actualizada
    this.broadcastVendors();
  }

  private broadcastVendors() {
    const vendorsList = Array.from(this.activeVendors.values());
    this.server.emit('vendorsUpdated', vendorsList);
  }
}
