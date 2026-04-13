import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { StatsService } from './stats.service';

@ApiTags('Stats')
@Controller()
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('players/:id/stats')
  @ApiOperation({ summary: 'Get player statistics' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Player statistics' })
  getPlayerStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.statsService.getPlayerStats(id);
  }

  @Get('tournaments/:id/standings')
  @ApiOperation({ summary: 'Get tournament standings' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Tournament standings' })
  getTournamentStandings(@Param('id', ParseUUIDPipe) id: string) {
    return this.statsService.getTournamentStandings(id);
  }

  @Get('stats/leaderboard')
  @ApiOperation({ summary: 'Get global leaderboard' })
  @ApiResponse({ status: 200, description: 'Global player rankings' })
  getLeaderboard() {
    return this.statsService.getLeaderboard();
  }
}
