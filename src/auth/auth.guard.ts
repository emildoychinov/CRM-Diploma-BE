import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UNAUTHORIZED_REQUEST_DECORATOR } from 'src/constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const allowUnauthorizedRequest = this.reflector.getAllAndOverride<boolean>(UNAUTHORIZED_REQUEST_DECORATOR, [context.getHandler(), context.getClass()])
    return allowUnauthorizedRequest || this.validateRequest(request);
  }

  validateRequest(request: any): boolean {
    const authHeader = request.headers['authorization'];
    console.log(authHeader);
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
      return true;
    } catch (error) {
      return false;
    }
  }
}