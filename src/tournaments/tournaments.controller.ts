import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TournamentStatus } from './entities/tournament.entity';
import { BracketsService } from '../brackets/brackets.service';

@ApiTags('Tournaments')
@Controller('tournaments')
export class TournamentsController {
  constructor(
    private tournamentsService: TournamentsService,
    private bracketsService: BracketsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all tournaments' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TournamentStatus,
  })
  @ApiResponse({ status: 200, description: 'List of tournaments' })
  findAll(@Query('status') status?: TournamentStatus) {
    return this.tournamentsService.findAll(status);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a tournament' })
  @ApiResponse({ status: 201, description: 'Tournament created' })
  create(@Body() createTournamentDto: CreateTournamentDto) {
    return this.tournamentsService.create(createTournamentDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tournament by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Tournament details' })
  @ApiResponse({ status: 404, description: 'Tournament not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tournamentsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a tournament' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTournamentDto: UpdateTournamentDto,
  ) {
    return this.tournamentsService.update(id, updateTournamentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a tournament' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tournamentsService.remove(id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a tournament' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  join(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.tournamentsService.join(id, user.id);
  }

  @Get(':id/matches')
  @ApiOperation({ summary: 'Get matches for a tournament' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findMatches(@Param('id', ParseUUIDPipe) id: string) {
    const tournament = await this.tournamentsService.findOne(id);
    return tournament.matches;
  }

  @Post(':id/generate-brackets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate brackets for a tournament' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  generateBrackets(@Param('id', ParseUUIDPipe) id: string) {
    return this.bracketsService.generateBrackets(id);
  }
}
