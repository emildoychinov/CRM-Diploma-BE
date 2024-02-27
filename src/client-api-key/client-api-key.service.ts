import { Injectable } from '@nestjs/common';
import { CreateClientApiKeyDto } from './dto/create-client-api-key.dto';
import { UpdateClientApiKeyDto } from './dto/update-client-api-key.dto';

@Injectable()
export class ClientApiKeyService {
  create(createClientApiKeyDto: CreateClientApiKeyDto) {
    return 'This action adds a new clientApiKey';
  }

  findAll() {
    return `This action returns all clientApiKey`;
  }

  findOne(id: number) {
    return `This action returns a #${id} clientApiKey`;
  }

  update(id: number, updateClientApiKeyDto: UpdateClientApiKeyDto) {
    return `This action updates a #${id} clientApiKey`;
  }

  remove(id: number) {
    return `This action removes a #${id} clientApiKey`;
  }
}
