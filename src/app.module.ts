import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { PlayersModule } from './players/players.module';
import { MatchesModule } from './matches/matches.module';
import { GamesModule } from './games/games.module';
import { StatsModule } from './stats/stats.module';
import { BracketsModule } from './brackets/brackets.module';
import { Tournament } from './tournaments/entities/tournament.entity';
import { Player } from './players/entities/player.entity';
import { Match } from './matches/entities/match.entity';
import { Game } from './games/entities/game.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'tournament_db'),
        entities: [Tournament, Player, Match, Game],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    TournamentsModule,
    PlayersModule,
    MatchesModule,
    GamesModule,
    StatsModule,
    BracketsModule,
  ],
})
export class AppModule {}
