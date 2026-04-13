import {
  IsString,
  IsInt,
  Min,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TournamentStatus } from '../entities/tournament.entity';

export class CreateTournamentDto {
  @ApiProperty({ example: 'League of Legends World Championship' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'League of Legends' })
  @IsString()
  game!: string;

  @ApiProperty({ example: 16 })
  @IsInt()
  @Min(2)
  maxPlayers!: number;

  @ApiProperty({ example: '2026-06-15T10:00:00Z' })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({ enum: TournamentStatus })
  @IsOptional()
  @IsEnum(TournamentStatus)
  status?: TournamentStatus;
}
