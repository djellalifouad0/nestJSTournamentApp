import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from '../matches/entities/match.entity';
import { Player } from '../players/entities/player.entity';
import { Tournament } from '../tournaments/entities/tournament.entity';

export interface PlayerStats {
  playerId: string;
  username: string;
  wins: number;
  losses: number;
  winRate: number;
  tournamentsPlayed: number;
  tournamentsWon: number;
}

export interface LeaderboardEntry {
  playerId: string;
  username: string;
  wins: number;
  losses: number;
  winRate: number;
}

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
    @InjectRepository(Tournament)
    private tournamentsRepository: Repository<Tournament>,
  ) {}

  async getPlayerStats(playerId: string): Promise<PlayerStats> {
    const player = await this.playersRepository.findOne({
      where: { id: playerId },
      relations: ['tournaments'],
    });
    if (!player) {
      throw new NotFoundException(`Player with ID "${playerId}" not found`);
    }

    const allMatches = await this.matchesRepository.find({
      where: [
        { player1Id: playerId, status: MatchStatus.COMPLETED },
        { player2Id: playerId, status: MatchStatus.COMPLETED },
      ],
    });

    const wins = allMatches.filter((m) => m.winnerId === playerId).length;
    const losses = allMatches.filter(
      (m) =>
        m.winnerId !== null && m.winnerId !== playerId && m.score !== 'BYE',
    ).length;
    const total = wins + losses;

    // Count tournaments won (player won the final match)
    const tournamentsWon = await this.countTournamentsWon(playerId);

    return {
      playerId: player.id,
      username: player.username,
      wins,
      losses,
      winRate: total > 0 ? Math.round((wins / total) * 100) / 100 : 0,
      tournamentsPlayed: player.tournaments?.length ?? 0,
      tournamentsWon,
    };
  }

  private async countTournamentsWon(playerId: string): Promise<number> {
    // A player wins a tournament if they won the final match (highest round)
    const tournaments = await this.tournamentsRepository.find({
      relations: ['players', 'matches'],
    });

    let count = 0;
    for (const tournament of tournaments) {
      if (!tournament.matches || tournament.matches.length === 0) continue;
      const maxRound = Math.max(...tournament.matches.map((m) => m.round));
      const finalMatch = tournament.matches.find(
        (m) => m.round === maxRound && m.status === MatchStatus.COMPLETED,
      );
      if (finalMatch && finalMatch.winnerId === playerId) {
        count++;
      }
    }
    return count;
  }

  async getTournamentStandings(
    tournamentId: string,
  ): Promise<
    { playerId: string; username: string; wins: number; losses: number }[]
  > {
    const tournament = await this.tournamentsRepository.findOne({
      where: { id: tournamentId },
      relations: ['players', 'matches'],
    });
    if (!tournament) {
      throw new NotFoundException(
        `Tournament with ID "${tournamentId}" not found`,
      );
    }

    const standings = tournament.players.map((player) => {
      const matches = tournament.matches.filter(
        (m) =>
          (m.player1Id === player.id || m.player2Id === player.id) &&
          m.status === MatchStatus.COMPLETED &&
          m.score !== 'BYE',
      );
      const wins = matches.filter((m) => m.winnerId === player.id).length;
      const losses = matches.filter(
        (m) => m.winnerId !== null && m.winnerId !== player.id,
      ).length;

      return {
        playerId: player.id,
        username: player.username,
        wins,
        losses,
      };
    });

    return standings.sort((a, b) => b.wins - a.wins);
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const players = await this.playersRepository.find();
    const leaderboard: LeaderboardEntry[] = [];

    for (const player of players) {
      const matches = await this.matchesRepository.find({
        where: [
          { player1Id: player.id, status: MatchStatus.COMPLETED },
          { player2Id: player.id, status: MatchStatus.COMPLETED },
        ],
      });

      const wins = matches.filter((m) => m.winnerId === player.id).length;
      const losses = matches.filter(
        (m) =>
          m.winnerId !== null && m.winnerId !== player.id && m.score !== 'BYE',
      ).length;
      const total = wins + losses;

      leaderboard.push({
        playerId: player.id,
        username: player.username,
        wins,
        losses,
        winRate: total > 0 ? Math.round((wins / total) * 100) / 100 : 0,
      });
    }

    return leaderboard.sort((a, b) => b.wins - a.wins || b.winRate - a.winRate);
  }
}
