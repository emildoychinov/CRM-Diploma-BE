import { CanActivate, ExecutionContext, Inject, Logger, forwardRef } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SUPERUSER } from "src/constants";
import { OperatorService } from "src/operator/operator.service";

export class SuperuserGuard implements CanActivate {
    constructor(private reflector: Reflector,
        @Inject(forwardRef(() => OperatorService))
        private readonly operatorService: OperatorService){}

    async canActivate(
      context: ExecutionContext
    ) {
      
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if(user?.is_authorized || user?.is_api){
            return true;
        }

        try{
            const operator = await this.operatorService.findOne(user.sub);
            if(operator.roles && operator.roles.some((role) => {
                return role.name === SUPERUSER;
            })){
                request.user = {...request.user, is_admin: true};
            }
        }catch(error){
            Logger.error(error);
            return false;
        }

        return true;
    }
  }