import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({cors: true}) // permite escuchar solicitudes de conexión
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService

  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload

    try {
      
      payload = this.jwtService.verify(token);
      // si lanza un error en el registroo...
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      //... se desconecta
      client.disconnect();
      return;
    }

    console.log({payload});

    
    // emitir a todos los clientes conectados: 
    // getConnectedClients es un arreglo de string
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients()); 

    console.log({conectados: this.messagesWsService.getConnectedClients()});
  }

  handleDisconnect(client: Socket) {
    ///console.log('Cliente desconectado:', client.id)
    this.messagesWsService.removeClient(client.id); // aqui se sabe cual fue el cliente (id) que se descoenctó
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients()); 
  }

  //message-from-client
  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto){
    //message-from-server
    // Emite únicamente al cliente.
    // client.emit('message-from-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message!!'
    // });

    //! Emitir a todos MENOS al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message!!'
    // });

    this.wss.to('clientID')

    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message!!'
    });

  }

}
