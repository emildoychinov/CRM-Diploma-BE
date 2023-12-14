import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from 'src/user/entities/user.entity';
import { AuthUserDto } from './dto/auth-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(authUserDto: AuthUserDto): Promise<User | null> {
    const user = await this.userService.findByEmail(authUserDto.email);
    if (user && user.password === authUserDto.password) {
      return user;
    }
    return null;
  }

  async login(authUserDto: AuthUserDto): Promise<{}> {
    const user = await this.validateUser(authUserDto)
    const payload = { sub: user?.id };
    return {
      token: this.jwtService.sign(payload),
      user: user
    };
  }
}