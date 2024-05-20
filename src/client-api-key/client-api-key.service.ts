import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateClientApiKeyDto } from './dto/create-client-api-key.dto';
import { UpdateClientApiKeyDto } from './dto/update-client-api-key.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientApiKey } from './entities/client-api-key.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { ClientService } from 'src/client/client.service';

@Injectable()
export class ClientApiKeyService {
  constructor(
    @InjectRepository(ClientApiKey)
    private apiKeyRepository: Repository<ClientApiKey>,
    private readonly authService: AuthService,
    @Inject(forwardRef(() => ClientService))
    private readonly clientService: ClientService,
  ) {}

  async createKey(createClientApiKeyDto: CreateClientApiKeyDto) {
    const clientID = createClientApiKeyDto.clientID;
    const keys = await this.constructKeys(clientID);

    const apiKey = this.apiKeyRepository.create({
      client: { id: clientID },
      token: keys.hashedToken,
    });

    const key = await this.apiKeyRepository.save(apiKey);
    this.clientService.updateApiKey(clientID, key);

    return { key, token: keys.token };
  }

  async constructKeys(clientID: number) {
    const token = this.authService.constructApiKey(clientID);
    const hashedToken = await bcrypt.hash(token, 10);
    return { token, hashedToken };
  }

  async refreshKey(updateClientDto: UpdateClientApiKeyDto) {
    const clientID = updateClientDto.clientID;
    try {
      const apiKey = await this.apiKeyRepository.findOneByOrFail({
        client: { id: updateClientDto.clientID },
      });

      const keys = await this.constructKeys(clientID);
      apiKey.token = keys.hashedToken;

      const key = await this.apiKeyRepository.save(apiKey);
      this.clientService.updateApiKey(clientID, key);
      return { token: keys.token };
    } catch (error) {
      return this.createKey(updateClientDto);
    }
  }

  deleteKey(clientID: number) {
    return this.apiKeyRepository.delete({ client: { id: clientID } });
  }
}
