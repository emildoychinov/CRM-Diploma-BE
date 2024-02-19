import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from 'src/user/entities/user.entity';
import { AuthUserDto } from './dto/auth-user.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(authUserDto: AuthUserDto): Promise<User | null> {
    const user = await this.userService.findByEmail(authUserDto.email);
    if (user && await bcrypt.compare(authUserDto.password, user.password)) {
      return user;
    }
    return null;
  }

  async loginOperator(authUserDto: AuthUserDto): Promise<{}> {
    const user = await this.validateUser(authUserDto)
    const payload = { sub: user?.id };
    if(user){
      return {
        token: this.jwtService.sign(payload),
        user: user
      };
    }else{
      return {};
    }
  }

  constructCostumerToken(customer: Customer){
    const payload = { sub: {id: customer.id, client_id: customer.client.id} };
      return {
        token: this.jwtService.sign(payload),
        user: customer
      }
  }


}