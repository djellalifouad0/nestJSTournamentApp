import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  publisher!: string;

  @Column()
  releaseDate!: Date;

  @Column()
  genre!: string;
}
