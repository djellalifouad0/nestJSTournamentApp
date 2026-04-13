import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { Tournament, TournamentStatus } from './entities/tournament.entity';
import { PlayersService } from '../players/players.service';
import { TournamentsGateway } from './tournaments.gateway';

describe('TournamentsService', () => {
  let service: TournamentsService;
  let repository: Partial<Record<keyof Repository<Tournament>, jest.Mock>>;
  let playersService: Partial<Record<keyof PlayersService, jest.Mock>>;
  let gateway: Partial<Record<keyof TournamentsGateway, jest.Mock>>;

  const mockTournament: Tournament = {
    id: 'uuid-1',
    name: 'Test Tournament',
    game: 'Test Game',
    maxPlayers: 8,
    startDate: new Date(),
    status: TournamentStatus.PENDING,
    createdAt: new Date(),
    players: [],
    matches: [],
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockReturnValue(mockTournament),
      save: jest.fn().mockResolvedValue(mockTournament),
      find: jest.fn().mockResolvedValue([mockTournament]),
      findOne: jest.fn().mockResolvedValue(mockTournament),
      remove: jest.fn().mockResolvedValue(mockTournament),
    };

    playersService = {
      findOne: jest.fn().mockResolvedValue({
        id: 'player-1',
        username: 'player1',
        email: 'p1@test.com',
        password: 'hash',
        avatar: '',
        isAdmin: false,
        createdAt: new Date(),
        tournaments: [],
        matchesAsPlayer1: [],
        matchesAsPlayer2: [],
        matchesWon: [],
      }),
    };

    gateway = {
      emitTournamentStatusChanged: jest.fn(),
      emitPlayerJoined: jest.fn(),
      emitMatchResultSubmitted: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentsService,
        { provide: getRepositoryToken(Tournament), useValue: repository },
        { provide: PlayersService, useValue: playersService },
        { provide: TournamentsGateway, useValue: gateway },
      ],
    }).compile();

    service = module.get<TournamentsService>(TournamentsService);
  });

  describe('create', () => {
    it('should create a tournament', async () => {
      const result = await service.create({
        name: 'Test',
        game: 'Game',
        maxPlayers: 8,
        startDate: '2026-06-15T10:00:00Z',
      });
      expect(result).toEqual(mockTournament);
    });
  });

  describe('findAll', () => {
    it('should return all tournaments', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockTournament]);
    });

    it('should filter by status', async () => {
      await service.findAll(TournamentStatus.PENDING);
      expect(repository.find).toHaveBeenCalledWith({
        where: { status: TournamentStatus.PENDING },
        relations: ['players'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a tournament', async () => {
      const result = await service.findOne('uuid-1');
      expect(result).toEqual(mockTournament);
    });

    it('should throw NotFoundException', async () => {
      repository.findOne!.mockResolvedValue(null);
      await expect(service.findOne('uuid-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('join', () => {
    it('should add player to tournament', async () => {
      const result = await service.join('uuid-1', 'player-1');
      expect(result).toEqual(mockTournament);
      expect(gateway.emitPlayerJoined).toHaveBeenCalled();
    });

    it('should throw if tournament is full', async () => {
      const fullTournament = {
        ...mockTournament,
        maxPlayers: 1,
        players: [{ id: 'other' }],
      };
      repository.findOne!.mockResolvedValue(fullTournament);
      await expect(service.join('uuid-1', 'player-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if tournament not pending', async () => {
      repository.findOne!.mockResolvedValue({
        ...mockTournament,
        status: TournamentStatus.IN_PROGRESS,
      });
      await expect(service.join('uuid-1', 'player-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a tournament', async () => {
      await service.remove('uuid-1');
      expect(repository.remove).toHaveBeenCalled();
    });
  });
});
