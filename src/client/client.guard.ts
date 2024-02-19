import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClientService } from './client.service';

@Injectable()
export class ClientGuard implements CanActivate {
  constructor(private clientService: ClientService){}
  async canActivate(
    context: ExecutionContext,
  ) {
    
    const request = context.switchToHttp().getRequest();
    const client = request.headers['x-client'];
    
    if(!client){
      return false;
    }

    try{
      const foundClient = await this.clientService.findByName(client);
      request.user = {...request.user, client_id : foundClient.id};
    }catch(error){
      return false;
    }

    return true;
  }
}
