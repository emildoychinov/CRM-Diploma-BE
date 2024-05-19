import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserRefreshTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    return await this.validateRequest(request);
  }

  async validateRequest(request: any): Promise<boolean> {
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      return false;
    }

    const [bearer, token] = authHeader.split(' ');

    if (!bearer || bearer !== 'Bearer') {
      return false;
    }

    try {
      const refreshTokenOptions = {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      };
      const decodedToken = this.jwtService.verify(token, refreshTokenOptions);
      request.user = decodedToken;

      const user = await this.userService.findById(request.user.sub);
      if (!user || !user.refresh_token || !(await bcrypt.compare(token, user?.refresh_token?.token))) {
        return false;
      }
      console.log(user);

      return true;
    } catch (error) {
      return false;
    }
  }
}
