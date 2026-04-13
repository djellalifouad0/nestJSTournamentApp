import { IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGameDto {
  @ApiProperty({ example: 'League of Legends' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Riot Games' })
  @IsString()
  publisher!: string;

  @ApiProperty({ example: '2009-10-27' })
  @IsDateString()
  releaseDate!: string;

  @ApiProperty({ example: 'MOBA' })
  @IsString()
  genre!: string;
}
