import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Tournament } from '../../tournaments/entities/tournament.entity';
import { Match } from '../../matches/entities/match.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Exclude()
  @Column()
  password!: string;

  @Column({ default: '' })
  avatar!: string;

  @Column({ default: false })
  isAdmin!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToMany(() => Tournament, (tournament) => tournament.players)
  tournaments!: Tournament[];

  @OneToMany(() => Match, (match) => match.player1)
  matchesAsPlayer1!: Match[];

  @OneToMany(() => Match, (match) => match.player2)
  matchesAsPlayer2!: Match[];

  @OneToMany(() => Match, (match) => match.winner)
  matchesWon!: Match[];
}
