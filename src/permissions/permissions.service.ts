import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}
  async create(createPermissionDto: CreatePermissionDto) {
    const subjectExists = await this.findSubject(createPermissionDto.subject);
    if (subjectExists) {
      try {
        await this.findOneWithAttributes(
          createPermissionDto.subject,
          createPermissionDto.action,
          createPermissionDto.conditions,
        );
      } catch (error) {
        const permission =
          this.permissionRepository.create(createPermissionDto);
        return this.permissionRepository.save(permission);
      }
      throw new Error('Permission already exists');
    } else {
      throw new Error('Permission subject not found ');
    }
  }

  async findOneWithAttributes(
    subject: string,
    action: string,
    conditions?: string,
  ) {
    try {
      const permission = await this.permissionRepository.findOneByOrFail({
        subject,
        action,
        conditions,
      });
      return permission;
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return this.permissionRepository.findAndCount();
  }

  async findOne(id: number) {
    return this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.roles', 'roles')
      .where('permission.id = :id', { id })
      .getOneOrFail();
  }

  remove(id: number) {
    return this.permissionRepository.delete({ id });
  }

  async addRole(id: number, role: Role) {
    const permission = await this.findOne(id);
    const { permissions, ...sanitizedRole } = role;

    if (permission) {
      if (!permission.roles?.find((role) => role.id == sanitizedRole.id)) {
        permission.roles?.push(sanitizedRole);
        return this.permissionRepository.save(permission);
      } else {
        throw new Error('Role already has this permission');
      }
    } else {
      throw new NotFoundException('Permission not found');
    }
  }

  async findSubject(subject: string) {
    const table = await this.permissionRepository.manager.query(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = $1
      )`,
      [subject.toLowerCase()],
    );
    return table[0].exists;
  }
}
