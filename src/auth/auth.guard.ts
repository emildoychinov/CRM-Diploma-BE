import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UNAUTHORIZED_REQUEST_DECORATOR } from 'src/constants';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private userService: UserService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const allowUnauthorizedRequest = this.reflector.getAllAndOverride<boolean>(UNAUTHORIZED_REQUEST_DECORATOR, [context.getHandler(), context.getClass()]);
    if(allowUnauthorizedRequest){
      request.user = {sub : 'allowed'};
    }
    return allowUnauthorizedRequest || (await this.validateRequest(request));
  }

  async validateRequest(request: any): Promise<boolean> {
    const authHeader = request.headers['authorization'];
    
    if(!authHeader){
      return false;
    }
    
    const [bearer, token] = authHeader.split(' ');

    if(!bearer || bearer !== 'Bearer'){
      return false;
    }

    try {
      const decodedToken = this.jwtService.verify(token);
      request.user = decodedToken;
      
      if(!request.user.refreshToken){
        return false;
      }

      const user = await this.userService.findById(request.user.sub);
      if(!user || !user.refresh_token)

      return true;
    } catch (error) {
      return false;
    }
  }
}