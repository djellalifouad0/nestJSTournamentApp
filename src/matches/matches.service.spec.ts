import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { Match, MatchStatus } from './entities/match.entity';
import { TournamentsGateway } from '../tournaments/tournaments.gateway';

describe('MatchesService', () => {
  let service: MatchesService;
  let repository: Partial<Record<keyof Repository<Match>, jest.Mock>>;
  let gateway: Partial<Record<keyof TournamentsGateway, jest.Mock>>;

  const mockMatch: Match = {
    id: 'match-1',
    tournamentId: 'tournament-1',
    player1Id: 'player-1',
    player2Id: 'player-2',
    winnerId: null,
    score: '',
    round: 1,
    bracketPosition: 0,
    status: MatchStatus.PENDING,
    tournament: {} as unknown as Match['tournament'],
    player1: {} as unknown as Match['player1'],
    player2: {} as unknown as Match['player2'],
    winner: null,
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockReturnValue(mockMatch),
      save: jest.fn().mockResolvedValue(mockMatch),
      find: jest.fn().mockResolvedValue([mockMatch]),
      findOne: jest.fn().mockResolvedValue(mockMatch),
      remove: jest.fn().mockResolvedValue(mockMatch),
    };

    gateway = {
      emitMatchResultSubmitted: jest.fn(),
      emitTournamentStatusChanged: jest.fn(),
      emitPlayerJoined: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        { provide: getRepositoryToken(Match), useValue: repository },
        { provide: TournamentsGateway, useValue: gateway },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
  });

  describe('findOne', () => {
    it('should return a match', async () => {
      const result = await service.findOne('match-1');
      expect(result).toEqual(mockMatch);
    });

    it('should throw NotFoundException', async () => {
      repository.findOne!.mockResolvedValue(null);
      await expect(service.findOne('wrong-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('submitResult', () => {
    it('should submit result', async () => {
      const completedMatch = {
        ...mockMatch,
        winnerId: 'player-1',
        score: '3-1',
        status: MatchStatus.COMPLETED,
      };
      repository.save!.mockResolvedValue(completedMatch);
      repository.find!.mockResolvedValue([completedMatch]);

      const result = await service.submitResult('match-1', {
        winnerId: 'player-1',
        score: '3-1',
      });

      expect(result.winnerId).toBe('player-1');
      expect(gateway.emitMatchResultSubmitted).toHaveBeenCalled();
    });

    it('should throw if match already completed', async () => {
      repository.findOne!.mockResolvedValue({
        ...mockMatch,
        status: MatchStatus.COMPLETED,
      });

      await expect(
        service.submitResult('match-1', {
          winnerId: 'player-1',
          score: '3-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if winner not a participant', async () => {
      await expect(
        service.submitResult('match-1', {
          winnerId: 'player-999',
          score: '3-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
