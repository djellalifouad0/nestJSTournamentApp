import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Match, MatchStatus } from '../matches/entities/match.entity';
import {
  Tournament,
  TournamentStatus,
} from '../tournaments/entities/tournament.entity';
import { Player } from '../players/entities/player.entity';

@Injectable()
export class BracketsService {
  constructor(
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
    @InjectRepository(Tournament)
    private tournamentsRepository: Repository<Tournament>,
    private dataSource: DataSource,
  ) {}

  async generateBrackets(tournamentId: string): Promise<Match[]> {
    const tournament = await this.tournamentsRepository.findOne({
      where: { id: tournamentId },
      relations: ['players', 'matches'],
    });

    if (!tournament) {
      throw new BadRequestException('Tournament not found');
    }

    if (tournament.status !== TournamentStatus.PENDING) {
      throw new BadRequestException(
        'Brackets can only be generated for pending tournaments',
      );
    }

    if (tournament.players.length < 2) {
      throw new BadRequestException(
        'At least 2 players are required to generate brackets',
      );
    }

    if (tournament.matches.length > 0) {
      throw new BadRequestException(
        'Brackets already generated for this tournament',
      );
    }

    const players = [...tournament.players];
    // Shuffle players
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }

    // Calculate total rounds needed
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(players.length)));
    const totalRounds = Math.log2(nextPowerOf2);
    const firstRoundMatches = nextPowerOf2 / 2;
    const byes = nextPowerOf2 - players.length;

    const allMatches: Match[] = [];

    // Create round 1 matches
    let position = 0;
    let playerIndex = 0;

    for (let i = 0; i < firstRoundMatches; i++) {
      const player1 = players[playerIndex];
      playerIndex++;

      const hasBye = i < byes;
      const player2 = hasBye ? player1 : (players[playerIndex] ?? player1);

      const saved = await this.matchesRepository.save(
        this.matchesRepository.create({
          tournament: { id: tournamentId } as Tournament,
          player1: { id: player1.id } as Player,
          player2: { id: player2.id } as Player,
          winner: hasBye ? ({ id: player1.id } as Player) : undefined,
          round: 1,
          bracketPosition: position,
          status: hasBye ? MatchStatus.COMPLETED : MatchStatus.PENDING,
          score: hasBye ? 'BYE' : '',
        }),
      );

      if (!hasBye) playerIndex++;
      position++;
      allMatches.push(saved);
    }

    // Create placeholder matches for subsequent rounds
    for (let round = 2; round <= totalRounds; round++) {
      const matchesInRound = Math.pow(2, totalRounds - round);
      for (let i = 0; i < matchesInRound; i++) {
        const saved = await this.matchesRepository.save(
          this.matchesRepository.create({
            tournament: { id: tournamentId } as Tournament,
            player1: { id: players[0].id } as Player,
            player2: { id: players[0].id } as Player,
            round,
            bracketPosition: i,
            status: MatchStatus.PENDING,
            score: '',
          }),
        );
        allMatches.push(saved);
      }
    }

    // Update tournament status (use update to avoid cascade issues)
    await this.tournamentsRepository.update(tournamentId, {
      status: TournamentStatus.IN_PROGRESS,
    });

    // Auto-advance byes
    if (byes > 0) {
      await this.advanceByeWinners(tournamentId, totalRounds);
    }

    return this.matchesRepository.find({
      where: { tournamentId },
      relations: ['player1', 'player2', 'winner'],
      order: { round: 'ASC', bracketPosition: 'ASC' },
    });
  }

  private async advanceByeWinners(
    tournamentId: string,
    totalRounds: number,
  ): Promise<void> {
    if (totalRounds < 2) return;

    const round1Matches = await this.matchesRepository.find({
      where: { tournamentId, round: 1 },
      order: { bracketPosition: 'ASC' },
    });

    const round2Matches = await this.matchesRepository.find({
      where: { tournamentId, round: 2 },
      order: { bracketPosition: 'ASC' },
    });

    for (let i = 0; i < round2Matches.length; i++) {
      const match1 = round1Matches[i * 2];
      const match2 = round1Matches[i * 2 + 1];
      const nextMatch = round2Matches[i];

      if (match1?.status === MatchStatus.COMPLETED && match1.winnerId) {
        nextMatch.player1Id = match1.winnerId;
      }
      if (match2?.status === MatchStatus.COMPLETED && match2.winnerId) {
        nextMatch.player2Id = match2.winnerId;
      }

      await this.matchesRepository.save(nextMatch);
    }
  }
}
