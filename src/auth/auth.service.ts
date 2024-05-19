import { ForbiddenException, Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from 'src/user/entities/user.entity';
import { AuthUserDto } from './dto/auth-user.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserRefreshTokenService } from '../user-refresh-token/user-refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    @Inject(forwardRef(() => UserRefreshTokenService))
    private userRefreshTokenService: UserRefreshTokenService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(authUserDto: AuthUserDto): Promise<User | null> {
    const user = await this.userService.findByEmail(authUserDto.email);
    if (user && (await bcrypt.compare(authUserDto.password, user.password))) {
      return user;
    }
    return null;
  }

  async loginOperator(authUserDto: AuthUserDto): Promise<{}> {
    let user = await this.validateUser(authUserDto);

    if (user) {
      return this.generateTokens(user);
    } else {
      return {};
    }
  }

  async generateTokens(user: User) {
    const accessToken = this.constructUserAccessToken(user?.id);
    const refreshToken = await this.userRefreshTokenService.createToken({
      userID: user?.id,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
      user: user,
    };
  }

  async logout(userID: number) {
    return this.userRefreshTokenService.deleteToken(userID);
  }

  async refreshTokens(user: any) {
    return this.constructUserAccessToken(user.id);
  }

  constructCostumerToken(customer: Customer) {
    const payload = { sub: { id: customer.id, client_id: customer.client.id } };
    return {
      token: this.jwtService.sign(payload),
      user: customer,
    };
  }

  constructUserAccessToken(userID: number) {
    const payload = { sub: userID };
    return this.jwtService.sign(payload);
  }

  constructUserRefreshToken(userID: number) {
    const payload = { sub: userID };
    const refreshTokenOptions = {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    };

    return this.jwtService.sign(payload, refreshTokenOptions);
  }

  constructApiKey(clientID: number) {
    const payload = { sub: clientID };
    const apiKeyOptions = {
      secret: this.configService.get<string>('JWT_API_KEY_SECRET'),
      expiresIn: '30d',
    };
    return this.jwtService.sign(payload, apiKeyOptions);
  }
}
