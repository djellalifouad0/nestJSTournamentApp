import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { SubmitResultDto } from './dto/submit-result.dto';
import { TournamentsGateway } from '../tournaments/tournaments.gateway';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
    private tournamentsGateway: TournamentsGateway,
  ) {}

  async create(createMatchDto: CreateMatchDto): Promise<Match> {
    const match = this.matchesRepository.create(createMatchDto);
    return this.matchesRepository.save(match);
  }

  async findAll(): Promise<Match[]> {
    return this.matchesRepository.find({
      relations: ['player1', 'player2', 'winner', 'tournament'],
    });
  }

  async findOne(id: string): Promise<Match> {
    const match = await this.matchesRepository.findOne({
      where: { id },
      relations: ['player1', 'player2', 'winner', 'tournament'],
    });
    if (!match) {
      throw new NotFoundException(`Match with ID "${id}" not found`);
    }
    return match;
  }

  async findByTournament(tournamentId: string): Promise<Match[]> {
    return this.matchesRepository.find({
      where: { tournamentId },
      relations: ['player1', 'player2', 'winner'],
      order: { round: 'ASC', bracketPosition: 'ASC' },
    });
  }

  async submitResult(
    id: string,
    submitResultDto: SubmitResultDto,
  ): Promise<Match> {
    const match = await this.findOne(id);

    if (match.status === MatchStatus.COMPLETED) {
      throw new BadRequestException('Match is already completed');
    }

    if (
      submitResultDto.winnerId !== match.player1Id &&
      submitResultDto.winnerId !== match.player2Id
    ) {
      throw new BadRequestException(
        'Winner must be one of the match participants',
      );
    }

    match.winnerId = submitResultDto.winnerId;
    match.score = submitResultDto.score;
    match.status = MatchStatus.COMPLETED;

    await this.matchesRepository.save(match);

    // Re-fetch to get full relations
    const updated = await this.findOne(id);

    this.tournamentsGateway.emitMatchResultSubmitted(updated);

    await this.advanceBracket(updated);

    return updated;
  }

  private async advanceBracket(completedMatch: Match): Promise<void> {
    const roundMatches = await this.matchesRepository.find({
      where: {
        tournamentId: completedMatch.tournamentId,
        round: completedMatch.round,
      },
    });

    const allCompleted = roundMatches.every(
      (m) => m.status === MatchStatus.COMPLETED,
    );

    if (!allCompleted) return;

    const nextRound = completedMatch.round + 1;
    const nextRoundMatches = await this.matchesRepository.find({
      where: {
        tournamentId: completedMatch.tournamentId,
        round: nextRound,
      },
      order: { bracketPosition: 'ASC' },
    });

    if (nextRoundMatches.length === 0) return;

    const winners = roundMatches
      .sort((a, b) => a.bracketPosition - b.bracketPosition)
      .map((m) => m.winnerId)
      .filter((id): id is string => id !== null);

    for (let i = 0; i < nextRoundMatches.length; i++) {
      const match = nextRoundMatches[i];
      const winner1 = winners[i * 2];
      const winner2 = winners[i * 2 + 1];

      if (winner1) match.player1Id = winner1;
      if (winner2) match.player2Id = winner2;

      if (match.player1Id && match.player2Id) {
        match.status = MatchStatus.PENDING;
      }

      await this.matchesRepository.save(match);
    }
  }

  async remove(id: string): Promise<void> {
    const match = await this.findOne(id);
    await this.matchesRepository.remove(match);
  }
}
