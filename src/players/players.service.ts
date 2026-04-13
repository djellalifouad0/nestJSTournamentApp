import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
  ) {}

  async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const player = this.playersRepository.create(createPlayerDto);
    return this.playersRepository.save(player);
  }

  async findAll(): Promise<Player[]> {
    return this.playersRepository.find();
  }

  async findOne(id: string): Promise<Player> {
    const player = await this.playersRepository.findOne({ where: { id } });
    if (!player) {
      throw new NotFoundException(`Player with ID "${id}" not found`);
    }
    return player;
  }

  async findByEmail(email: string): Promise<Player | null> {
    return this.playersRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<Player | null> {
    return this.playersRepository.findOne({ where: { username } });
  }

  async update(id: string, updatePlayerDto: UpdatePlayerDto): Promise<Player> {
    const player = await this.findOne(id);
    Object.assign(player, updatePlayerDto);
    return this.playersRepository.save(player);
  }

  async remove(id: string): Promise<void> {
    const player = await this.findOne(id);
    await this.playersRepository.remove(player);
  }

  async findPlayerTournaments(id: string): Promise<Player> {
    const player = await this.playersRepository.findOne({
      where: { id },
      relations: ['tournaments'],
    });
    if (!player) {
      throw new NotFoundException(`Player with ID "${id}" not found`);
    }
    return player;
  }
}
