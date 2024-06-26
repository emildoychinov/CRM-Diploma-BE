import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Operator } from 'src/operator/entities/operator.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Repository } from 'typeorm';
import { RequiredRule } from '../../decorators/ability/ability.decorator';
import {
  ForbiddenError,
  MongoAbility,
  Subject,
  defineAbility,
  subject,
} from '@casl/ability';
import { SubjectActions } from 'src/enums/subject-actions.enum';
import { DecoratorMetadata } from 'src/enums/decorator.enum';

type Abilities = [string, Subject];
export type AppAbility = MongoAbility<Abilities>;


//TODO : faster guards ; dont query for operator everywhere...
@Injectable()
export class AbilityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Operator)
    private operatorRepository: Repository<Operator>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireSuperuser = this.reflector.getAllAndOverride<boolean>(
      DecoratorMetadata.REQUIRE_SUPERUSER_ROLE,
      [context.getHandler(), context.getClass()],
    );

    const rules: any =
      this.reflector.get<RequiredRule[]>(
        DecoratorMetadata.CHECK_ABILITY,
        context.getHandler(),
      ) || [];
    const request = context.switchToHttp().getRequest();

    for (const rule of rules) {
      if (!(await this.findSubject(rule?.subject))) {
        Logger.error(`Permission subject ${rule.subject} does not exist`);
        throw new NotFoundException(
          `Permission subject ${rule.subject} does not exist`,
        );
      }

      if (!Object.values(SubjectActions).includes(rule.action)) {
        Logger.error(`Permission action ${rule.action} does not exist`);
        throw new NotFoundException(
          `Permission action ${rule.action} does not exist`,
        );
      }
    }

    const user = request.user;

    if (requireSuperuser || user?.is_admin) {
      return user?.is_admin;
    }

    if (user?.is_authorized) {
      return true;
    }

    const operator = await this.operatorRepository
      .createQueryBuilder('operator')
      .leftJoinAndSelect('operator.user', 'user')
      .leftJoinAndSelect('operator.client', 'client')
      .leftJoinAndSelect('operator.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions')
      .where('user.id = :id', { id: request.user.sub })
      .getOneOrFail();

    if (!operator?.roles || !operator?.roles?.length) {
      return false;
    }

    if (operator?.client && operator?.client?.id !== user?.client_id) {
      return false;
    }

    let seenIds = new Set<number>();

    const ability = defineAbility((can, cannot) => {
      if (operator.roles) {
        for (const role of operator.roles) {
          for (const permission of role.permissions as Permission[]) {
            if (!seenIds.has(permission.id)) {
              if (permission.conditions) {
                can(
                  permission.action,
                  permission.subject,
                  permission.conditions,
                );
              } else {
                can(permission.action, permission.subject);
              }
              seenIds.add(permission.id);
            }
          }
        }
      }
    });

    for (const rule of rules) {
      ForbiddenError.from(ability)
        .setMessage('You are not allowed to perform this action')
        .throwUnlessCan(rule.action, rule.subject);
    }

    return true;
  }

  async findSubject(subject: string) {
    if (!subject) {
      return true;
    }
    const table = await this.operatorRepository.manager.query(
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
