import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { SubmitResultDto } from './dto/submit-result.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Matches')
@Controller('matches')
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Post(':id/result')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit match result' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Result submitted' })
  @ApiResponse({ status: 400, description: 'Invalid result' })
  submitResult(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() submitResultDto: SubmitResultDto,
  ) {
    return this.matchesService.submitResult(id, submitResultDto);
  }
}
