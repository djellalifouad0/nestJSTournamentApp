import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PlayersService } from '../players/players.service';
import { Player } from '../players/entities/player.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let playersService: Partial<Record<keyof PlayersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

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
    playersService = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PlayersService, useValue: playersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new player', async () => {
      playersService.findByEmail!.mockResolvedValue(null);
      playersService.findByUsername!.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      playersService.create!.mockResolvedValue(mockPlayer);

      const result = await service.register({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result).toEqual(mockPlayer);
      expect(playersService.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      playersService.findByEmail!.mockResolvedValue(mockPlayer);

      await expect(
        service.register({
          username: 'other',
          email: 'test@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if username exists', async () => {
      playersService.findByEmail!.mockResolvedValue(null);
      playersService.findByUsername!.mockResolvedValue(mockPlayer);

      await expect(
        service.register({
          username: 'testuser',
          email: 'new@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('should return player if credentials valid', async () => {
      playersService.findByEmail!.mockResolvedValue(mockPlayer);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@test.com', 'password123');
      expect(result).toEqual(mockPlayer);
    });

    it('should return null if player not found', async () => {
      playersService.findByEmail!.mockResolvedValue(null);

      const result = await service.validateUser('wrong@test.com', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password invalid', async () => {
      playersService.findByEmail!.mockResolvedValue(mockPlayer);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@test.com', 'wrong');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token', () => {
      const result = service.login(mockPlayer);
      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockPlayer.id,
        email: mockPlayer.email,
        isAdmin: mockPlayer.isAdmin,
      });
    });
  });
});
