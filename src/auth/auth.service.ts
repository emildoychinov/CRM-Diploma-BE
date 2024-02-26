import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from 'src/user/entities/user.entity';
import { AuthUserDto } from './dto/auth-user.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService
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
    
    if(user){
      return this.generateTokens(user);
    }else{
      return {};
    }
  }

  async generateTokens(user: User){
    
    let payload: any = { sub: user?.id };
    const refreshTokenOptions = {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    }

    const refreshToken = this.jwtService.sign(
      payload,
      refreshTokenOptions
    );

    payload = {
      ...payload,
      refreshToken
    };

    const hashedToken = await bcrypt.hash(refreshToken, 10);
    user = await this.userService.update(user?.id as number, {refreshToken: hashedToken}) as User;

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
      user: user
    };
  }

  async logout(userID: number){
    return this.userService.update(userID, {refreshToken: null});
  }

  async refreshTokens(userId: number, refreshToken: string){
    const user = await this.userService.findById(userId);

    if (!user || !user.refresh_token)
      throw new ForbiddenException('Access Denied');

    if (!(await bcrypt.compare(refreshToken, user.refresh_token))) 
      throw new ForbiddenException('Access Denied');

    return this.generateTokens(user);
  }

  constructCostumerToken(customer: Customer){
    const payload = { sub: {id: customer.id, client_id: customer.client.id} };
      return {
        token: this.jwtService.sign(payload),
        user: customer
      }
  }


}