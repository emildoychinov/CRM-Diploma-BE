import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Job } from "bull";
import Redis from "ioredis";
import { EntityService } from "src/enums/role.entities.enum";
import { OperatorService } from "src/operator/operator.service";
import { PermissionsService } from "src/permissions/permissions.service";
import { QueueService } from "src/queue/queue.service";
import { Role } from "src/roles/entities/role.entity";
import { RolesService } from "./roles.service";
import { Operator } from "src/operator/entities/operator.entity";
import { Permission } from "src/permissions/entities/permission.entity";

@Injectable()
export class RolesListener {
    constructor(
      @Inject('REDIS') 
      private readonly redis: Redis,
      private queueService: QueueService,
      private operatorService: OperatorService,
      private premissionService: PermissionsService,
      private roleService: RolesService) {
        this.roleService.findAll().then((roles: any) => {
          roles.forEach((role: any) => {
            const queue = this.queueService.getQueue(`role.${role.id}`);
            this.queueService.createProcess(queue, 
              `role.${role.id}.addToEntityProcess`,
              this.addToEntityProcess.bind(this),
            )
          })
        })
        
      }

    async addToEntityProcess(job: Job<{ 
      role: Role, entitiesDto: 
      any, entityService: 
      EntityService }>){

        const { role, entitiesDto, entityService } = job.data;;
        let service: any;
        let addRole: Function;
        switch (entityService){
          case EntityService.OPERATOR:
            service = this.operatorService;
            addRole = (role: Role, entity: Operator) => role.operators?.push(entity)
            break;
          default :
          case EntityService.PERMISSION:
            service = this.premissionService;
            addRole = (role: Role, entity: Permission) => role.permissions?.push(entity)
            break; 
        }

        try{
          if (entitiesDto && entitiesDto.length > 0) {
            const promises = entitiesDto.map(async (entity: any) => {
            const roleEntity = await service.addRole(entity.id, role);
            addRole(role, roleEntity);
          });
            await Promise.all(promises).then(async () => {
              return await this.roleService.saveOne(role);
            });
          }
        }catch(error){
          console.error(error);
          throw new InternalServerErrorException(error.message);
        }
    }



    
  
  }
  