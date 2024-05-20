import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Repository } from 'typeorm';
import { OperatorService } from 'src/operator/operator.service';
import { Operator } from 'src/operator/entities/operator.entity';
import { ClientApiKeyService } from 'src/client-api-key/client-api-key.service';
import { ClientApiKey } from 'src/client-api-key/entities/client-api-key.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @Inject(forwardRef(() => OperatorService))
    private readonly operatorService: OperatorService,
    @Inject(forwardRef(() => ClientApiKeyService))
    private readonly apiKeyService: ClientApiKeyService,
  ) {}

  async create(createClientDto: CreateClientDto) {
    try {
      const client = this.clientRepository.create(createClientDto);
      const savedClient = await this.clientRepository.save(client);
      const keyAndToken = await this.apiKeyService.createKey({
        clientID: savedClient.id,
      });
      savedClient.api_key = keyAndToken.key;
      return { api_key: keyAndToken.token, client: savedClient };
    } catch (error) {
      throw new Error('Failed to create client');
    }
  }

  async findAll() {
    return this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.operators', 'operators')
      .leftJoinAndSelect('operators.roles', 'roles')
      .leftJoinAndSelect('operators.user', 'user')
      .leftJoinAndSelect('client.api_key', 'api_key')
      .getMany();
  }

  async findByName(name: string) {
    return this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.operators', 'operators')
      .leftJoinAndSelect('operators.roles', 'roles')
      .leftJoinAndSelect('operators.user', 'user')
      .leftJoinAndSelect('client.api_key', 'api_key')
      .where('client.name = :name', { name })
      .getOneOrFail();
  }

  async findById(id: number) {
    return this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.operators', 'operators')
      .leftJoinAndSelect('client.roles', 'room_roles')
      .leftJoinAndSelect('operators.roles', 'roles')
      .leftJoinAndSelect('operators.user', 'user')
      .leftJoinAndSelect('client.customers', 'room_customers')
      .leftJoinAndSelect('client.api_key', 'api_key')
      .where('client.id = :id', { id })
      .getOneOrFail();
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    const client = await this.findById(id);
    const operators = updateClientDto.operators;
    if (client) {
      if (operators && operators?.length) {
        this.addOperators(client, operators);
      }
    } else {
      throw new NotFoundException('Client not found');
    }
  }

  async updateApiKey(id: number, apiKey: ClientApiKey) {
    const client = await this.findById(id);
    if (client) {
      if (
        !client.api_key ||
        (client.api_key && client.api_key.id == apiKey.id)
      ) {
        client.api_key = apiKey;
        await this.clientRepository.save(client);
      } else {
        Logger.error(
          `API Key ${apiKey.id} does not belong to client ${client.id}`,
        );
        return `API Key ${apiKey.id} does not belong to client ${client.id}`;
      }
    } else {
      throw new NotFoundException('Client not found');
    }
  }

  async addOperators(client: Partial<Client>, operators: Partial<Operator>[]) {
    for (const operator of operators) {
      try {
        const { client: operatorClient, ...clientOperator } =
          await this.operatorService.assignClient(
            operator.id as number,
            client,
          );
        if (!client.operators?.includes(operator as Operator)) {
          client.operators?.push(clientOperator);
        }
      } catch (error) {
        console.error(error);
        return false;
      }
    }
    return this.clientRepository.save(client);
  }

  async addRole(clientID: number, role: Role) {
    const { operators, client: roleClient, ...sanitizedRole } = role;
    const client = await this.findById(clientID);
    if (roleClient && roleClient.id != clientID) {
      throw new Error('Role belongs to another client');
    }
    if (client) {
      if (!client.roles?.find((role) => role.name === sanitizedRole.name)) {
        client.roles?.push(sanitizedRole);
        return this.clientRepository.save(client);
      } else {
        throw new Error('Role already exists whitin this client');
      }
    } else {
      throw new NotFoundException('Client not found');
    }
  }


  //TODO : resolve constraint problems stopping client from being deleted
  remove(id: number) {
    this.apiKeyService.deleteKey(id);
    return this.clientRepository.delete({ id });
  }
}
