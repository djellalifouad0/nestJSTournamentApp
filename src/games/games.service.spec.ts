import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GamesService } from './games.service';
import { Game } from './entities/game.entity';

describe('GamesService', () => {
  let service: GamesService;
  let repository: Partial<Record<keyof Repository<Game>, jest.Mock>>;

  const mockGame: Game = {
    id: 'game-1',
    name: 'League of Legends',
    publisher: 'Riot Games',
    releaseDate: new Date('2009-10-27'),
    genre: 'MOBA',
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockReturnValue(mockGame),
      save: jest.fn().mockResolvedValue(mockGame),
      find: jest.fn().mockResolvedValue([mockGame]),
      findOne: jest.fn().mockResolvedValue(mockGame),
      remove: jest.fn().mockResolvedValue(mockGame),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        { provide: getRepositoryToken(Game), useValue: repository },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
  });

  describe('create', () => {
    it('should create a game', async () => {
      const result = await service.create({
        name: 'League of Legends',
        publisher: 'Riot Games',
        releaseDate: '2009-10-27',
        genre: 'MOBA',
      });
      expect(result).toEqual(mockGame);
    });
  });

  describe('findAll', () => {
    it('should return all games', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockGame]);
    });
  });

  describe('findOne', () => {
    it('should return a game', async () => {
      const result = await service.findOne('game-1');
      expect(result).toEqual(mockGame);
    });

    it('should throw NotFoundException', async () => {
      repository.findOne!.mockResolvedValue(null);
      await expect(service.findOne('wrong')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a game', async () => {
      const result = await service.update('game-1', { name: 'Updated' });
      expect(result).toEqual(mockGame);
    });
  });

  describe('remove', () => {
    it('should remove a game', async () => {
      await service.remove('game-1');
      expect(repository.remove).toHaveBeenCalled();
    });
  });
});
