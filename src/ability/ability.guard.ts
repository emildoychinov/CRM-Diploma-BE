import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Operator } from 'src/operator/entities/operator.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Repository } from 'typeorm';
import { RequiredRule, CHECK_ABILITY } from './ability.decorator';
import {
  subject,
  RawRuleOf,
  ForcedSubject,
  ForbiddenError,
  createMongoAbility,
  MongoAbility,
  Abilities,
} from '@casl/ability';

export const actions = [
  'read',
  'manage',
  'create',
  'update',
  'delete'
] as const;

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
    private roleRepository: Repository<Role>

  ) {}

  async canActivate(context: ExecutionContext,): Promise<boolean> {
    const rules: any =
      this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) ||
      [];
    const request = context.switchToHttp().getRequest();
    const auth = request.headers['authorization'];

    if(!auth){
      return false;
    }

    const {bearer, token} = auth.split(' ');
    if(bearer != 'bearer' || !token){
      return false;
    }

    const userID = this.jwtService.decode(token).sub;
    const operator = await this.operatorRepository.createQueryBuilder('operator')
      .leftJoinAndSelect('operator.user', 'user')
      .leftJoinAndSelect('operator.roles', 'roles')
      .where('user.id = :userID', { userID })
      .getOne();
    
    if(!operator || !operator?.roles || 
      !operator?.roles?.length || !operator?.client){
      return false;
    }

    const permissions: Permission[] = [];
    for(const role of operator.roles){
      permissions.push(...(
        await this.permissionRepository.createQueryBuilder('permissions')
        .innerJoin('permission.roles', 'role')
        .where('role.id = :roleID', {roleID : role.id})
        .getMany()
      ));
    }
    for (const rule of rules){

    }


    return true;
  }
}
