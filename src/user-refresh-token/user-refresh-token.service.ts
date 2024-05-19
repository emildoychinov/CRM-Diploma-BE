import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateUserRefreshTokenDto } from './dto/create-user-refresh-token.dto';
import { UpdateUserRefreshTokenDto } from './dto/update-user-refresh-token.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRefreshToken } from './entities/user-refresh-token.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserRefreshTokenService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @InjectRepository(UserRefreshToken)
    private repository: Repository<UserRefreshToken>
  ) {}

  async createToken(createUserRefreshTokenDto: CreateUserRefreshTokenDto) {
    const userID = createUserRefreshTokenDto.userID;
    const keys = await this.constructKeys(userID);
    const existingToken = await this.findToken(userID);

    if (existingToken) {
      return await this.refresh(userID, existingToken);
    }

    const token = this.repository.create({
      user: { id: userID },
      token: keys.hashedToken,
    });

    await this.repository.save(token);

    return { token: keys.token };
  }

  async constructKeys(clientID: number) {
    const token = this.authService.constructUserRefreshToken(clientID);
    const hashedToken = await bcrypt.hash(token, 10);
    return { token, hashedToken };
  }

  async findToken(userID: number) {
    const token = await this.repository.findOne({
      where: {
        user: {
          id: userID,
        },
      },
    });
    return token;
  }

  async refresh(userID: number, refreshed: UserRefreshToken) {
    const keys = await this.constructKeys(userID);
    refreshed.token = keys.hashedToken;
    await this.repository.save(refreshed);

    return { token: keys.token };
  }

  async deleteToken(userID: number) {
    return await this.repository.delete({ user: { id: userID } });
  }
}
