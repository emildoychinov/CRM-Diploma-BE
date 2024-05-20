import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClientService } from '../../client/client.service';
import { Reflector } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { DecoratorMetadata } from 'src/enums/decorator.enum';

@Injectable()
export class ClientGuard implements CanActivate {
  constructor(
    private clientService: ClientService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const client = request.headers['x-client'];
    let clientApiKey = '';
    const requireApiKey = this.reflector.getAllAndOverride<boolean>(
      DecoratorMetadata.REQUIRE_API_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (user?.is_authorized || user?.is_admin) {
      return true;
    }

    if (!client) {
      return false;
    }

    try {
      const foundClient = await this.clientService.findByName(client);
      if (requireApiKey) {
        clientApiKey = request.headers['authorization'];
        if (!foundClient.api_key || !foundClient?.api_key.token) {
          return false;
        }
        request.user = {
          ...request.user,
          api_key: foundClient.api_key.token,
          client_id: foundClient.id,
        };
      }

      request.user = { ...request.user, client_id: foundClient.id };
    } catch (error) {
      Logger.error(error);
      return false;
    }

    return true;
  }
}
