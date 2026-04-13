import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Tournament } from './entities/tournament.entity';
import { Match } from '../matches/entities/match.entity';
import { Player } from '../players/entities/player.entity';

@WebSocketGateway({ cors: { origin: '*' } })
export class TournamentsGateway {
  @WebSocketServer()
  server!: Server;

  emitTournamentStatusChanged(tournament: Tournament) {
    this.server.emit('tournamentStatusChanged', tournament);
  }

  emitPlayerJoined(tournamentId: string, player: Partial<Player>) {
    this.server.emit('playerJoined', { tournamentId, player });
  }

  emitMatchResultSubmitted(match: Match) {
    this.server.emit('matchResultSubmitted', match);
  }
}
