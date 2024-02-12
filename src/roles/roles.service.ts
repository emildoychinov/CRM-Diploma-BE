import { Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, forwardRef } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { ClientService } from 'src/client/client.service';
import { Operator } from 'src/operator/entities/operator.entity';
import { OperatorService } from 'src/operator/operator.service';
import { SUPERUSER } from 'src/constants';
import { PermissionsService } from 'src/permissions/permissions.service';
import { Client } from 'src/client/entities/client.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { QueueService } from 'src/queue/queue.service';
import { RolesListener } from 'src/roles/roles.listener';
import { EntityService } from 'src/enums/role.entities.enum';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @Inject(forwardRef(() => ClientService))
    private clientService: ClientService,
    @Inject(forwardRef(() => OperatorService))
    private operatorService: OperatorService,
    @Inject(PermissionsService)
    private permissionService: PermissionsService,
    private readonly queueService: QueueService,
  ) {}
  create(createRoleDto: CreateRoleDto) {
    //TODO : superusers can create other superusers, but regular operators cannot
    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  findAll() {
    return this.roleRepository.find();
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

  async saveOne(role: Role){
    return await this.roleRepository.save(role);
  }


  //TODO : find a way to return data back to the client
  
  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.findById(id);
    if (!role) {
        throw new NotFoundException('Role not found');
    }

    try {
      await this.updateClient(role, updateRoleDto.client);

      await this.enqueueUpdateEntities(
        role, 
        updateRoleDto.operators, 
        EntityService.OPERATOR, 
      );

      await this.enqueueUpdateEntities(
        role, 
        updateRoleDto.permissions, 
        EntityService.PERMISSION, 
      );

    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async updateClient(role: Role, clientDto: Partial<Client> | undefined) {
      if (clientDto) {
          const roleClient = await this.clientService.addRole(clientDto.id as number, role);
          role.client = roleClient;
      }
  }

  private async updateEntities(role: Role, entitiesDto: any[] | undefined, service: any, addRoleCallback: Function) {
    if (entitiesDto && entitiesDto.length > 0) {
        const promises = entitiesDto.map(async entity => {
            const roleEntity = await service.addRole(entity.id, role);
            addRoleCallback(role, roleEntity);
        });
        await Promise.all(promises);
    }
  }

  private async enqueueUpdateEntities(role: Role, entitiesDto: any[] | undefined, service: EntityService) {
    
    await this.queueService.add(
      this.queueService.getQueue(`role.${role.id}`),
        `role.${role.id}.addToEntityProcess`,
        {
          role,
          entitiesDto,
          entityService: service
        }
      );

  } 


  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
