import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { ClientService } from 'src/client/client.service';
import { Operator } from 'src/operator/entities/operator.entity';
import { OperatorService } from 'src/operator/operator.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @Inject(forwardRef(() => ClientService))
    private clientService: ClientService,
    @Inject(forwardRef(() => OperatorService))
    private operatorService: OperatorService

  ) {}
  create(createRoleDto: CreateRoleDto) {
    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  findAll() {
    return `This action returns all roles`;
  }

  findByName(name: string){
    return this.roleRepository.createQueryBuilder('role')
    .leftJoinAndSelect('role.client', 'client')
    .leftJoinAndSelect('role.operators', 'operators')
    .leftJoinAndSelect('role.permissions', 'permissions')
    .where('role.name = :name', { name })
    .getOne();
  }
  
  findById(id: number) {
    return this.roleRepository.createQueryBuilder('role')
    .leftJoinAndSelect('role.client', 'client')
    .leftJoinAndSelect('role.operators', 'operators')
    .leftJoinAndSelect('role.permissions', 'permissions')
    .where('role.id = :id', { id })
    .getOne()
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.findById(id);
    const client = updateRoleDto.client;
    const operators = updateRoleDto.operators;
    const permissions = updateRoleDto.permissions;
    if(role){
      if(client){
        try{
          const roleClient = await this.clientService.addRole(client.id as number, role);
          role.client = roleClient;
        }catch(error){
          console.error(error);
          return error.message;
        }
      }
      if(operators){
        try{
          for(let operator of operators){
            const roleOperator = await this.operatorService.addRole(operator.id as number, role);
            role.operators?.push(roleOperator);
          }
        }catch(error){
          console.error(error);
          return error.message;
        }
      }
      return this.roleRepository.save(role);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
