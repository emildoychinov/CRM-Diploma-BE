import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Repository } from 'typeorm';
import { OperatorService } from 'src/operator/operator.service';
import { Operator } from 'src/operator/entities/operator.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @Inject(forwardRef(() => OperatorService))
    private operatorService: OperatorService,
  ) { }

  create(createClientDto: CreateClientDto) {
    try{
      const client = this.clientRepository.create(createClientDto);
      return this.clientRepository.save(client);
    } catch (error) {
      throw new Error('Failed to create client');
    }
  }

  findAll() {
    return `This action returns all client`;
  }

  async findByName(name: string){
    return this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.operators', 'operators')
      .leftJoinAndSelect('operators.roles', 'roles')
      .leftJoinAndSelect('operators.user', 'user')
      .where('client.name = :name', {name})
      .getOne();
  }

  async findById(id: number) {
    return this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.operators', 'operators')
      .leftJoinAndSelect('client.roles', 'room_roles')
      .leftJoinAndSelect('operators.roles', 'roles')
      .leftJoinAndSelect('operators.user', 'user')
      .where('client.id = :id', {id})
      .getOne();
  }


  async update(id: number, updateClientDto: UpdateClientDto) {
    const client = await this.findById(id);
    const operators = updateClientDto.operators;
    if(client){
      if(operators && operators?.length){
        this.addOperators(client, operators);
      }
    }else{
      throw new NotFoundException('Client not found');
    }
  }

  async addOperators(client: Partial<Client>, operators: Partial<Operator>[]){

    for (const operator of operators){
      try{
        const {client : operatorClient, ...clientOperator} = await this.operatorService.assignClient(operator.id as number, client);
        if(!client.operators?.includes(operator as Operator)){
          client.operators?.push(clientOperator)
        }
      }catch(error){
        console.error(error);
        return false;
      }
    }
    return this.clientRepository.save(client);
  }

  async addRole(clientID: number, role: Role){
    const {operators, client: roleClient,...sanitizedRole} = role;
    const client = await this.findById(clientID);
    if(roleClient && roleClient.id != clientID){
      throw new Error('Role belongs to another client');
    }
    if(client){
      if(!client.roles?.find(role => role.name === sanitizedRole.name)){
        client.roles?.push(sanitizedRole);
        return this.clientRepository.save(client);
      }else{
        throw new Error('Role already exists whitin this client')
      }
    }else{
      throw new NotFoundException('Client not found')
    }
  }

  remove(id: number) {
    return `This action removes a #${id} client`;
  }
}
