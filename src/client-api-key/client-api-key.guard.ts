import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { REQUIRE_API_KEY } from 'src/constants';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClientApiKeyGuard implements CanActivate {
  constructor(private reflector: Reflector, 
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService){}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    
    const requireApiKey = this.reflector.getAllAndOverride<boolean>(REQUIRE_API_KEY, 
      [context.getHandler(), 
        context.getClass()]);
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const clientApiKey = request.headers['authorization'];

    if(user?.is_admin || user?.is_authorized){
      return true;
    }

    if(requireApiKey){ 
      const [bearer, token] = clientApiKey.split(' ');
      if(!bearer || bearer !== 'Bearer'){
        return false;
      }
      
      try{
        this.jwtService.verify(token, {
          secret: this.configService.get<string>('JWT_API_KEY_SECRET')
        });
      }catch(error){
        Logger.log(error.message);
        return false;
      }
      const apiKeysMatch = await bcrypt.compare(token, user.api_key);
      if(apiKeysMatch){
        request.user = {...request.user, is_authorized: true};
      }
      return apiKeysMatch;
    }

    return true;
  }
}
