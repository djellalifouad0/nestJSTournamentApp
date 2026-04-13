import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { Match } from '../matches/entities/match.entity';
import { Player } from '../players/entities/player.entity';
import { Tournament } from '../tournaments/entities/tournament.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Player, Tournament])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
