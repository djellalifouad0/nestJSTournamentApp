import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tournament } from '../../tournaments/entities/tournament.entity';
import { Player } from '../../players/entities/player.entity';

export enum MatchStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  tournamentId!: string;

  @Column()
  player1Id!: string;

  @Column({ nullable: true })
  player2Id!: string;

  @Column({ nullable: true })
  winnerId!: string | null;

  @Column({ default: '' })
  score!: string;

  @Column()
  round!: number;

  @Column({ default: 0 })
  bracketPosition!: number;

  @Column({
    type: 'varchar',
    default: MatchStatus.PENDING,
  })
  status!: MatchStatus;

  @ManyToOne(() => Tournament, (tournament) => tournament.matches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tournamentId' })
  tournament!: Tournament;

  @ManyToOne(() => Player, (player) => player.matchesAsPlayer1, {
    eager: true,
  })
  @JoinColumn({ name: 'player1Id' })
  player1!: Player;

  @ManyToOne(() => Player, (player) => player.matchesAsPlayer2, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'player2Id' })
  player2!: Player;

  @ManyToOne(() => Player, (player) => player.matchesWon, {
    nullable: true,
  })
  @JoinColumn({ name: 'winnerId' })
  winner!: Player | null;
}
