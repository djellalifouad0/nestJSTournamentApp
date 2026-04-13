import { IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitResultDto {
  @ApiProperty({ description: 'ID of the winning player' })
  @IsUUID()
  winnerId!: string;

  @ApiProperty({ example: '3-1', description: 'Match score' })
  @IsString()
  score!: string;
}
