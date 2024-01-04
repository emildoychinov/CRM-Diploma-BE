import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Operator } from 'src/operator/entities/operator.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Repository } from 'typeorm';
import { RequiredRule } from './ability.decorator';
import {
  subject,
  RawRuleOf,
  ForcedSubject,
  ForbiddenError,
  createMongoAbility,
  MongoAbility,
  Subject,
} from '@casl/ability';
import { Client } from 'src/client/entities/client.entity';
import { CHECK_ABILITY, SUPERUSER } from 'src/constants';

export const actions = [
  'read',
  'manage',
  'create',
  'update',
  'delete'
] as const;

type Abilities = [string, Subject];
export type AppAbility = MongoAbility<Abilities>;

@Injectable()
export class AbilityGuard implements CanActivate {
  
  createAbility = (rules: RawRuleOf<AppAbility>[]) => createMongoAbility<AppAbility>(rules);
  
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    @InjectRepository(Operator)
    private operatorRepository: Repository<Operator>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>

  ) {}

  async canActivate(context: ExecutionContext,): Promise<boolean> {
    const rules: any =
      this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) ||
      [];
    const request = context.switchToHttp().getRequest();
    const auth = request.headers['authorization'];
    const client = request.headers['x-client'];

    if(!client){
      return false;
    }

    if(!auth){
      return false;
    }

    const [bearer, token] = auth.split(' ');
    if(bearer != 'Bearer' || !token){
      return false;
    }

    const userID = this.jwtService.decode(token).sub;
    const operator = await this.operatorRepository.createQueryBuilder('operator')
      .leftJoinAndSelect('operator.roles', 'roles')
      .leftJoinAndSelect('operator.client', 'client')
      .where('operator.user.id = :userID', { userID })
      .getOne();
    
    
    if(!operator?.roles || !operator?.roles?.length){
      return false;
    }

    if(operator.roles.some((role) => {
      role.name === SUPERUSER;
    })){
      return true;
    }

    if(operator?.client || operator?.client?.name !== client){
      return false;
    }

    const permissions = [];
    for(const role of operator.roles){
      permissions.push(...(
        await this.permissionRepository.createQueryBuilder('permissions')
        .innerJoin('permission.roles', 'role')
        .where('role.id = :roleID', {roleID : role.id})
        .getMany()
      ));
    }

    



    return true;
  }

  async findSubject(subject: string){
    const table = await this.clientRepository.manager.query(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = $1
      )`,
      [subject.toLowerCase()]
    );
    return table[0].exists;
  }

  
}
