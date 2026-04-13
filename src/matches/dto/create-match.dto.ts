import { IsUUID, IsInt, Min, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus } from '../entities/match.entity';

export class CreateMatchDto {
  @ApiProperty()
  @IsUUID()
  tournamentId!: string;

  @ApiProperty()
  @IsUUID()
  player1Id!: string;

  @ApiProperty()
  @IsUUID()
  player2Id!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  round!: number;

  @ApiPropertyOptional({ enum: MatchStatus })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;
}
