import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PlayersService } from './players.service';
import { Player } from './entities/player.entity';

describe('PlayersService', () => {
  let service: PlayersService;
  let repository: Partial<Record<keyof Repository<Player>, jest.Mock>>;

  const mockPlayer: Player = {
    id: 'uuid-1',
    username: 'testuser',
    email: 'test@test.com',
    password: 'hashedpassword',
    avatar: '',
    isAdmin: false,
    createdAt: new Date(),
    tournaments: [],
    matchesAsPlayer1: [],
    matchesAsPlayer2: [],
    matchesWon: [],
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockReturnValue(mockPlayer),
      save: jest.fn().mockResolvedValue(mockPlayer),
      find: jest.fn().mockResolvedValue([mockPlayer]),
      findOne: jest.fn().mockResolvedValue(mockPlayer),
      remove: jest.fn().mockResolvedValue(mockPlayer),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayersService,
        { provide: getRepositoryToken(Player), useValue: repository },
      ],
    }).compile();

    service = module.get<PlayersService>(PlayersService);
  });

  describe('create', () => {
    it('should create a player', async () => {
      const result = await service.create({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
      });
      expect(result).toEqual(mockPlayer);
    });
  });

  describe('findAll', () => {
    it('should return array of players', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockPlayer]);
    });
  });

  describe('findOne', () => {
    it('should return a player by id', async () => {
      const result = await service.findOne('uuid-1');
      expect(result).toEqual(mockPlayer);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findOne!.mockResolvedValue(null);
      await expect(service.findOne('uuid-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should find player by email', async () => {
      const result = await service.findByEmail('test@test.com');
      expect(result).toEqual(mockPlayer);
    });
  });

  describe('update', () => {
    it('should update a player', async () => {
      const result = await service.update('uuid-1', { username: 'updated' });
      expect(result).toEqual(mockPlayer);
    });
  });

  describe('remove', () => {
    it('should remove a player', async () => {
      await service.remove('uuid-1');
      expect(repository.remove).toHaveBeenCalled();
    });
  });
});
