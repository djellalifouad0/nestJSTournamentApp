import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PlayersService } from '../players/players.service';
import { RegisterDto } from './dto/register.dto';
import { Player } from '../players/entities/player.entity';

@Injectable()
export class AuthService {
  constructor(
    private playersService: PlayersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<Player> {
    const existingByEmail = await this.playersService.findByEmail(
      registerDto.email,
    );
    if (existingByEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingByUsername = await this.playersService.findByUsername(
      registerDto.username,
    );
    if (existingByUsername) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    return this.playersService.create({
      ...registerDto,
      password: hashedPassword,
    });
  }

  async validateUser(email: string, password: string): Promise<Player | null> {
    const player = await this.playersService.findByEmail(email);
    if (!player) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, player.password);
    if (!isPasswordValid) {
      return null;
    }
    return player;
  }

  login(user: Player): { access_token: string } {
    const payload = {
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
