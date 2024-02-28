import { CanActivate, ExecutionContext, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Operator } from 'src/operator/entities/operator.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Repository } from 'typeorm';
import { RequiredRule } from '../../decorators/ability/ability.decorator';
import {
  ForbiddenError,
  MongoAbility,
  Subject,
  defineAbility,
  subject,
} from '@casl/ability';
import { CHECK_ABILITY, REQUIRE_SUPERUSER_ROLE, SUBJECT_ACTIONS} from 'src/constants';

type Abilities = [string, Subject];
export type AppAbility = MongoAbility<Abilities>;

@Injectable()
export class AbilityGuard implements CanActivate {
  
  constructor(
    private reflector: Reflector,
    @InjectRepository(Operator)
    private operatorRepository: Repository<Operator>,

  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    const requireSuperuser = this.reflector.getAllAndOverride<boolean>(REQUIRE_SUPERUSER_ROLE, 
      [context.getHandler(), context.getClass()]);

    const rules: any =
      this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) ||
      [];
    const request = context.switchToHttp().getRequest();
    

    for(const rule of rules){
      if(!(await this.findSubject(rule?.subject))){
        Logger.error(`Permission subject ${rule.subject} does not exist`);
        throw new NotFoundException(`Permission subject ${rule.subject} does not exist`);
      }

      if(rule.action && !SUBJECT_ACTIONS.includes(rule.action)){
        Logger.error(`Permission action ${rule.action} does not exist`);
        throw new NotFoundException(`Permission action ${rule.action} does not exist`);
      }
    }
    
    const user = request.user;

    if(requireSuperuser || user?.is_admin){
      return user?.is_admin;
    }

    if(user?.is_authorized){
      return true;
    }
    
    const operator = await this.operatorRepository.createQueryBuilder('operator')
      .leftJoinAndSelect('operator.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions')
      .leftJoinAndSelect('operator.client', 'client')
      .where('operator.user.id = :id', { id: user.sub })
      .getOneOrFail();
    
    
    if(!operator?.roles || !operator?.roles?.length){
      return false;
    }


    if(operator?.client && operator?.client?.id !== user?.client_id){
      return false;
    }

    let seenIds = new Set<number>();

    const ability = defineAbility((can, cannot) => {
      if(operator.roles){
        for (const role of operator.roles) {
          for (const permission of role.permissions as Permission[]) {
            if (!seenIds.has(permission.id)) {
              if(permission.conditions){
                can(permission.action, permission.subject, permission.conditions);
              }else{
                can(permission.action, permission.subject);
              }
              seenIds.add(permission.id);
            }
          }
        }
      }
    });

    for(const rule of rules){
      ForbiddenError.from(ability)
        .setMessage('You are not allowed to perform this action')
        .throwUnlessCan(rule.action, rule.subject);
    }

    return true;
  }

  async findSubject(subject: string){
    if(!subject){
      return true;
    }
    const table = await this.operatorRepository.manager.query(
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
