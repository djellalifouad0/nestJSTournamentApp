import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../src/auth/auth.module';
import { TournamentsModule } from '../src/tournaments/tournaments.module';
import { PlayersModule } from '../src/players/players.module';
import { MatchesModule } from '../src/matches/matches.module';
import { GamesModule } from '../src/games/games.module';
import { StatsModule } from '../src/stats/stats.module';
import { BracketsModule } from '../src/brackets/brackets.module';
import { Tournament } from '../src/tournaments/entities/tournament.entity';
import { Player } from '../src/players/entities/player.entity';
import { Match } from '../src/matches/entities/match.entity';
import { Game } from '../src/games/entities/game.entity';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { DataSource } from 'typeorm';
import type { Server } from 'http';

describe('Tournament API (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let jwtToken: string;
  let adminToken: string;
  let playerId: string;
  let adminPlayerId: string;
  let tournamentId: string;
  let matchId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              JWT_SECRET: 'test-secret',
              JWT_EXPIRATION: '3600',
            }),
          ],
        }),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Tournament, Player, Match, Game],
          synchronize: true,
          dropSchema: true,
          logging: false,
        }),
        AuthModule,
        TournamentsModule,
        PlayersModule,
        MatchesModule,
        GamesModule,
        StatsModule,
        BracketsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(reflector),
      new TransformInterceptor(),
    );

    await app.init();
    httpServer = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  // ==================== AUTH ====================

  describe('Auth', () => {
    it('POST /auth/register - should register a player', async () => {
      const res = await request(httpServer)
        .post('/auth/register')
        .send({
          username: 'testplayer',
          email: 'test@test.com',
          password: 'password123',
          avatar: 'https://example.com/avatar.png',
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.username).toBe('testplayer');
      expect(res.body.data.email).toBe('test@test.com');
      expect(res.body.data.password).toBeUndefined();
      playerId = res.body.data.id;
    });

    it('POST /auth/register - should reject duplicate email', async () => {
      await request(httpServer)
        .post('/auth/register')
        .send({
          username: 'other',
          email: 'test@test.com',
          password: 'password123',
        })
        .expect(409);
    });

    it('POST /auth/register - should reject invalid data', async () => {
      await request(httpServer)
        .post('/auth/register')
        .send({
          username: '',
          email: 'not-an-email',
          password: '12',
        })
        .expect(400);
    });

    it('POST /auth/register - should reject non-whitelisted fields', async () => {
      await request(httpServer)
        .post('/auth/register')
        .send({
          username: 'player2',
          email: 'p2@test.com',
          password: 'password123',
          isAdmin: true,
        })
        .expect(400);
    });

    it('POST /auth/login - should login and return JWT', async () => {
      const res = await request(httpServer)
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123',
        })
        .expect(201);

      expect(res.body.data.access_token).toBeDefined();
      jwtToken = res.body.data.access_token;
    });

    it('POST /auth/login - should reject invalid credentials', async () => {
      await request(httpServer)
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should register a second player', async () => {
      const res = await request(httpServer)
        .post('/auth/register')
        .send({
          username: 'player2',
          email: 'player2@test.com',
          password: 'password123',
        })
        .expect(201);
      expect(res.body.data.id).toBeDefined();
    });

    it('should register admin player', async () => {
      // Register a third player we'll make admin via direct DB manipulation
      const res = await request(httpServer)
        .post('/auth/register')
        .send({
          username: 'adminuser',
          email: 'admin@test.com',
          password: 'password123',
        })
        .expect(201);

      adminPlayerId = res.body.data.id;

      // Make admin via TypeORM
      const dataSource = app.get(DataSource);
      await dataSource
        .getRepository(Player)
        .update(adminPlayerId, { isAdmin: true });

      // Login as admin
      const loginRes = await request(httpServer)
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        })
        .expect(201);

      adminToken = loginRes.body.data.access_token;
    });
  });

  // ==================== TOURNAMENTS ====================

  describe('Tournaments', () => {
    it('POST /tournaments - should create (authenticated)', async () => {
      const res = await request(httpServer)
        .post('/tournaments')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'Test Tournament',
          game: 'League of Legends',
          maxPlayers: 4,
          startDate: '2026-06-15T10:00:00Z',
        })
        .expect(201);

      expect(res.body.data.name).toBe('Test Tournament');
      tournamentId = res.body.data.id;
    });

    it('POST /tournaments - should return 401 without JWT', async () => {
      await request(httpServer)
        .post('/tournaments')
        .send({
          name: 'Test',
          game: 'Game',
          maxPlayers: 8,
          startDate: '2026-06-15T10:00:00Z',
        })
        .expect(401);
    });

    it('POST /tournaments - should reject invalid data', async () => {
      await request(httpServer)
        .post('/tournaments')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 123,
          maxPlayers: -1,
        })
        .expect(400);
    });

    it('GET /tournaments - should list tournaments', async () => {
      const res = await request(httpServer).get('/tournaments').expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /tournaments?status=pending - should filter by status', async () => {
      const res = await request(httpServer)
        .get('/tournaments?status=pending')
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      res.body.data.forEach((t: any) => {
        expect(t.status).toBe('pending');
      });
    });

    it('GET /tournaments/:id - should return tournament details', async () => {
      const res = await request(httpServer)
        .get(`/tournaments/${tournamentId}`)
        .expect(200);

      expect(res.body.data.id).toBe(tournamentId);
      expect(res.body.data.name).toBe('Test Tournament');
    });

    it('GET /tournaments/:id - should return 400 for invalid UUID', async () => {
      await request(httpServer).get('/tournaments/not-a-uuid').expect(400);
    });

    it('GET /tournaments/:id - should return 404 for non-existent', async () => {
      await request(httpServer)
        .get('/tournaments/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('PUT /tournaments/:id - should update (authenticated)', async () => {
      const res = await request(httpServer)
        .put(`/tournaments/${tournamentId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ name: 'Updated Tournament' })
        .expect(200);

      expect(res.body.data.name).toBe('Updated Tournament');
    });

    it('PUT /tournaments/:id - should return 401 without JWT', async () => {
      await request(httpServer)
        .put(`/tournaments/${tournamentId}`)
        .send({ name: 'Fail' })
        .expect(401);
    });

    it('POST /tournaments/:id/join - should join tournament', async () => {
      const res = await request(httpServer)
        .post(`/tournaments/${tournamentId}/join`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(201);

      expect(res.body.data.players.length).toBe(1);
    });

    it('POST /tournaments/:id/join - should reject duplicate join', async () => {
      await request(httpServer)
        .post(`/tournaments/${tournamentId}/join`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
    });

    it('POST /tournaments/:id/join - should return 401 without JWT', async () => {
      await request(httpServer)
        .post(`/tournaments/${tournamentId}/join`)
        .expect(401);
    });

    it('GET /tournaments/:id/matches - should return matches', async () => {
      const res = await request(httpServer)
        .get(`/tournaments/${tournamentId}/matches`)
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  // ==================== PLAYERS ====================

  describe('Players', () => {
    it('GET /players - should list players', async () => {
      const res = await request(httpServer).get('/players').expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      // Password should be excluded
      res.body.data.forEach((p: any) => {
        expect(p.password).toBeUndefined();
      });
    });

    it('GET /players/:id - should return player', async () => {
      const res = await request(httpServer)
        .get(`/players/${playerId}`)
        .expect(200);

      expect(res.body.data.id).toBe(playerId);
      expect(res.body.data.password).toBeUndefined();
    });

    it('GET /players/:id - should return 400 for invalid UUID', async () => {
      await request(httpServer).get('/players/not-a-uuid').expect(400);
    });

    it('GET /players/:id/tournaments - should return player tournaments', async () => {
      const res = await request(httpServer)
        .get(`/players/${playerId}/tournaments`)
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  // ==================== GAMES ====================

  describe('Games', () => {
    it('POST /games - should create game (admin)', async () => {
      const res = await request(httpServer)
        .post('/games')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'League of Legends',
          publisher: 'Riot Games',
          releaseDate: '2009-10-27',
          genre: 'MOBA',
        })
        .expect(201);

      expect(res.body.data.name).toBe('League of Legends');
    });

    it('POST /games - should return 403 for non-admin', async () => {
      await request(httpServer)
        .post('/games')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'Test',
          publisher: 'Test',
          releaseDate: '2020-01-01',
          genre: 'FPS',
        })
        .expect(403);
    });

    it('POST /games - should return 401 without JWT', async () => {
      await request(httpServer)
        .post('/games')
        .send({
          name: 'Test',
          publisher: 'Test',
          releaseDate: '2020-01-01',
          genre: 'FPS',
        })
        .expect(401);
    });

    it('POST /games - should reject invalid data', async () => {
      await request(httpServer)
        .post('/games')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 123,
        })
        .expect(400);
    });

    it('GET /games - should list games', async () => {
      const res = await request(httpServer).get('/games').expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  // ==================== BRACKETS & MATCHES ====================

  describe('Brackets and Matches', () => {
    let bracketTournamentId: string;
    let player2Token: string;

    beforeAll(async () => {
      // Login as player2
      const loginRes = await request(httpServer)
        .post('/auth/login')
        .send({ email: 'player2@test.com', password: 'password123' });
      player2Token = loginRes.body.data.access_token;

      // Create a 2-player tournament for bracket testing
      const tRes = await request(httpServer)
        .post('/tournaments')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'Bracket Tournament',
          game: 'CS2',
          maxPlayers: 4,
          startDate: '2026-07-01T10:00:00Z',
        });
      bracketTournamentId = tRes.body.data.id;

      // Both players join
      await request(httpServer)
        .post(`/tournaments/${bracketTournamentId}/join`)
        .set('Authorization', `Bearer ${jwtToken}`);

      await request(httpServer)
        .post(`/tournaments/${bracketTournamentId}/join`)
        .set('Authorization', `Bearer ${player2Token}`);

      // Also have admin join
      await request(httpServer)
        .post(`/tournaments/${bracketTournamentId}/join`)
        .set('Authorization', `Bearer ${adminToken}`);
    });

    it('POST /tournaments/:id/generate-brackets - should generate brackets', async () => {
      // Verify tournament exists and has players
      const checkRes = await request(httpServer).get(
        `/tournaments/${bracketTournamentId}`,
      );
      console.log(
        'Tournament before bracket gen:',
        JSON.stringify(checkRes.body.data?.players?.length),
        'status:',
        checkRes.body.data?.status,
      );

      const res = await request(httpServer)
        .post(`/tournaments/${bracketTournamentId}/generate-brackets`)
        .set('Authorization', `Bearer ${jwtToken}`);

      if (res.status !== 201) {
        console.error('Bracket generation error:', JSON.stringify(res.body));
      }
      expect(res.status).toBe(201);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      matchId = res.body.data[0].id;
    });

    it('POST /tournaments/:id/generate-brackets - should reject if already generated', async () => {
      await request(httpServer)
        .post(`/tournaments/${bracketTournamentId}/generate-brackets`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
    });

    it('POST /matches/:id/result - should submit result', async () => {
      // Get the actual match to know player IDs
      const matchesRes = await request(httpServer).get(
        `/tournaments/${bracketTournamentId}/matches`,
      );
      const pendingMatch = matchesRes.body.data.find(
        (m: any) => m.status === 'pending',
      );

      if (pendingMatch) {
        const res = await request(httpServer)
          .post(`/matches/${pendingMatch.id}/result`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            winnerId: pendingMatch.player1Id,
            score: '3-1',
          })
          .expect(201);

        expect(res.body.data.status).toBe('completed');
        // winnerId may be returned as direct field or via winner relation
        const winnerId = res.body.data.winnerId ?? res.body.data.winner?.id;
        expect(winnerId).toBe(pendingMatch.player1Id);
      }
    });

    it('POST /matches/:id/result - should return 401 without JWT', async () => {
      await request(httpServer)
        .post(`/matches/${matchId}/result`)
        .send({ winnerId: playerId, score: '3-0' })
        .expect(401);
    });

    it('POST /matches/:id/result - should reject invalid winner', async () => {
      // Create another tournament with fresh match for this test
      const matchesRes = await request(httpServer).get(
        `/tournaments/${bracketTournamentId}/matches`,
      );
      const aMatch = matchesRes.body.data.find(
        (m: any) => m.status === 'pending',
      );

      if (aMatch) {
        await request(httpServer)
          .post(`/matches/${aMatch.id}/result`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            winnerId: '00000000-0000-0000-0000-000000000000',
            score: '3-0',
          })
          .expect(400);
      }
    });
  });

  // ==================== STATS ====================

  describe('Stats', () => {
    it('GET /players/:id/stats - should return player stats', async () => {
      const res = await request(httpServer)
        .get(`/players/${playerId}/stats`)
        .expect(200);

      expect(res.body.data.playerId).toBe(playerId);
      expect(res.body.data.wins).toBeDefined();
      expect(res.body.data.losses).toBeDefined();
      expect(res.body.data.winRate).toBeDefined();
    });

    it('GET /stats/leaderboard - should return leaderboard', async () => {
      const res = await request(httpServer)
        .get('/stats/leaderboard')
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('GET /tournaments/:id/standings - should return standings', async () => {
      // Use any existing tournament
      const tournaments = await request(httpServer).get('/tournaments');
      const tid = tournaments.body.data[0].id;

      const res = await request(httpServer)
        .get(`/tournaments/${tid}/standings`)
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  // ==================== DELETE ====================

  describe('Cleanup', () => {
    it('DELETE /tournaments/:id - should delete (authenticated)', async () => {
      await request(httpServer)
        .delete(`/tournaments/${tournamentId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
    });

    it('DELETE /tournaments/:id - should return 401 without JWT', async () => {
      await request(httpServer)
        .delete(`/tournaments/${tournamentId}`)
        .expect(401);
    });
  });

  // ==================== RESPONSE FORMAT ====================

  describe('Response format (TransformInterceptor)', () => {
    it('should wrap responses in { data, statusCode, timestamp }', async () => {
      const res = await request(httpServer).get('/players').expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('statusCode');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body.statusCode).toBe(200);
    });
  });
});
