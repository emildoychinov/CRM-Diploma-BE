import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { ClientService } from 'src/client/client.service';
import { SUPERUSER } from 'src/constants';
import { Client } from 'src/client/entities/client.entity';
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
    private readonly queueService: QueueService,
  ) {}

  createRole(createRoleDto: CreateRoleDto, user: any) {
    if (createRoleDto.name === SUPERUSER) {
      throw new UnauthorizedException(
        `${SUPERUSER.toUpperCase()} is a reserved role name.`,
      );
    }
    return user.is_admin
      ? this.createRoleGlobally(createRoleDto)
      : this.createRoleInInstance(createRoleDto, user.client_id);
  }

  createRoleInInstance(createRoleDto: CreateRoleDto, clientID: number) {
    const { client, ...sanitizedDto } = createRoleDto;
    const role = this.roleRepository.create({
      client: {
        id: clientID,
      },
      ...sanitizedDto,
    });
    return this.roleRepository.save(role);
  }

  createRoleGlobally(createRoleDto: CreateRoleDto) {
    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  findAllInClient(clientID: number) {
    return this.roleRepository.find({
      where: {
        client: { id: clientID },
      },
      relations: ['permissions', 'client'],
    });
  }

  findAll() {
    return this.roleRepository.find({
      relations: ['permissions', 'client'],
    });
  }

  async findRoles(user: any) {
    return user?.is_admin
      ? this.findAll()
      : this.findAllInClient(user.client_id);
  }

  async findByIdAndClient(id: number, clientID: number) {
    return this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.client', 'client')
      .leftJoinAndSelect('role.operators', 'operators')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .where('role.id = :id', { id })
      .andWhere('role.client.id = :clientID', { clientID })
      .getOne();
  }

  async findById(id: number) {
    return this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.client', 'client')
      .leftJoinAndSelect('role.operators', 'operators')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .where('role.id = :id', { id })
      .getOne();
  }

  async findRole(id: number, user: any) {
    return user?.is_admin
      ? this.findById(id)
      : this.findByIdAndClient(id, user.client_id);
  }

  findByName(name: string) {
    return this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.client', 'client')
      .leftJoinAndSelect('role.operators', 'operators')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .where('role.name = :name', { name })
      .getOne();
  }

  async saveOne(role: Role) {
    return await this.roleRepository.save(role);
  }

  //TODO : find a way to return data back to the client

  async update(id: number, updateRoleDto: UpdateRoleDto, user: any) {
    let role = await this.findRole(id, user);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    try {
      if (user.is_admin) {
        role = await this.updateClient(role, updateRoleDto.client);
      }

      await this.enqueueUpdateEntities(
        role,
        updateRoleDto.operators,
        EntityService.OPERATOR,
        role.client ? role.client.id : undefined,
      );

      await this.enqueueUpdateEntities(
        role,
        updateRoleDto.permissions,
        EntityService.PERMISSION,
        role.client ? role.client.id : undefined,
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async updateClient(
    role: Role,
    clientDto: Partial<Client> | undefined,
  ) {
    if (clientDto) {
      const roleClient = await this.clientService.addRole(
        clientDto.id as number,
        role,
      );
      role.client = roleClient;
    }
    return role;
  }

  private async enqueueUpdateEntities(
    role: Role,
    entitiesDto: any[] | undefined,
    service: EntityService,
    clientID: number | undefined,
  ) {
    await this.queueService.add(
      this.queueService.getQueue(`role.${role.id}`),
      `role.${role.id}.addToEntityProcess`,
      {
        role,
        entitiesDto,
        entityService: service,
        clientID,
      },
    );
  }

  removeRole(id: number, user: any) {
    return user?.is_admin
      ? this.removeById(id)
      : this.removeByClientAndId(id, user.client_id);
  }

  removeByClientAndId(id: number, clientID: number) {
    return this.roleRepository.delete({
      id,
      client: {
        id: clientID,
      },
    });
  }

  removeById(id: number) {
    return this.roleRepository.delete(id);
  }
}
