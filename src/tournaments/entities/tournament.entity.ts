import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Player } from '../../players/entities/player.entity';
import { Match } from '../../matches/entities/match.entity';

export enum TournamentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  game!: string;

  @Column()
  maxPlayers!: number;

  @Column()
  startDate!: Date;

  @Column({
    type: 'varchar',
    default: TournamentStatus.PENDING,
  })
  status!: TournamentStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToMany(() => Player, (player) => player.tournaments, { eager: false })
  @JoinTable({
    name: 'tournament_players',
    joinColumn: { name: 'tournamentId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'playerId', referencedColumnName: 'id' },
  })
  players!: Player[];

  @OneToMany(() => Match, (match) => match.tournament)
  matches!: Match[];
}
