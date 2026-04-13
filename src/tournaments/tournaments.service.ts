import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament, TournamentStatus } from './entities/tournament.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { PlayersService } from '../players/players.service';
import { TournamentsGateway } from './tournaments.gateway';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(Tournament)
    private tournamentsRepository: Repository<Tournament>,
    private playersService: PlayersService,
    private tournamentsGateway: TournamentsGateway,
  ) {}

  async create(createTournamentDto: CreateTournamentDto): Promise<Tournament> {
    const tournament = this.tournamentsRepository.create(createTournamentDto);
    return this.tournamentsRepository.save(tournament);
  }

  async findAll(status?: TournamentStatus): Promise<Tournament[]> {
    if (status) {
      return this.tournamentsRepository.find({
        where: { status },
        relations: ['players'],
      });
    }
    return this.tournamentsRepository.find({ relations: ['players'] });
  }

  async findOne(id: string): Promise<Tournament> {
    const tournament = await this.tournamentsRepository.findOne({
      where: { id },
      relations: ['players', 'matches'],
    });
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID "${id}" not found`);
    }
    return tournament;
  }

  async update(
    id: string,
    updateTournamentDto: UpdateTournamentDto,
  ): Promise<Tournament> {
    const tournament = await this.findOne(id);
    Object.assign(tournament, updateTournamentDto);
    const saved = await this.tournamentsRepository.save(tournament);
    if (updateTournamentDto.status) {
      this.tournamentsGateway.emitTournamentStatusChanged(saved);
    }
    return saved;
  }

  async remove(id: string): Promise<void> {
    const tournament = await this.findOne(id);
    await this.tournamentsRepository.remove(tournament);
  }

  async join(tournamentId: string, playerId: string): Promise<Tournament> {
    const tournament = await this.findOne(tournamentId);
    const player = await this.playersService.findOne(playerId);

    if (tournament.status !== TournamentStatus.PENDING) {
      throw new BadRequestException(
        'Cannot join a tournament that is not pending',
      );
    }

    if (tournament.players.length >= tournament.maxPlayers) {
      throw new BadRequestException('Tournament is full');
    }

    const alreadyJoined = tournament.players.some((p) => p.id === playerId);
    if (alreadyJoined) {
      throw new BadRequestException('Player already joined this tournament');
    }

    tournament.players.push(player);
    const saved = await this.tournamentsRepository.save(tournament);

    this.tournamentsGateway.emitPlayerJoined(tournamentId, {
      id: player.id,
      username: player.username,
    });

    return saved;
  }
}
