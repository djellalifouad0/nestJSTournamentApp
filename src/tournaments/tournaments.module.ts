import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentsService } from './tournaments.service';
import { TournamentsController } from './tournaments.controller';
import { TournamentsGateway } from './tournaments.gateway';
import { Tournament } from './entities/tournament.entity';
import { PlayersModule } from '../players/players.module';
import { BracketsModule } from '../brackets/brackets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tournament]),
    PlayersModule,
    BracketsModule,
  ],
  controllers: [TournamentsController],
  providers: [TournamentsService, TournamentsGateway],
  exports: [TournamentsService, TournamentsGateway],
})
export class TournamentsModule {}
