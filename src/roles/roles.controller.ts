import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AllowUnauthorizedRequest } from 'src/decorators/allow-unauthorized-request/allow-unauthorized-request.decorator';
import { UserRequest } from 'src/interfaces/requests/user.request';
import { RequireSuperuser } from 'src/decorators/require-superuser/require-superuser.decorator';
import { checkAbilites } from 'src/decorators/ability/ability.decorator';
import { SubjectActions } from 'src/enums/subject-actions.enum';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @checkAbilites({action: SubjectActions.CREATE, subject: 'role'})
  @Post('/create')
  create(@Body() createRoleDto: CreateRoleDto, @Req() request: UserRequest) {
    return this.rolesService.createRole(createRoleDto, request.user);
  }

  @checkAbilites({action: SubjectActions.READ, subject: 'role'})
  @Get('/all')
  findAll(@Req() request: UserRequest) {
    return this.rolesService.findRoles(request.user);
  }

  @RequireSuperuser()
  @Get('/all/:client_id')
  findAllInInstance(@Param('client_id') clientID: string){
    return this.rolesService.findAllInClient(+clientID);
  }

  @checkAbilites({action: SubjectActions.READ, subject: 'role'})
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: UserRequest) {
    return this.rolesService.findRole(+id, request.user);
  }

  @checkAbilites({action: SubjectActions.UPDATE, subject: 'role'})
  @Patch('/update/:id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @Req() request: UserRequest) {
    return this.rolesService.update(+id, updateRoleDto, request.user);
  }

  @checkAbilites({action: SubjectActions.DELETE, subject: 'role'})
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: UserRequest) {
    return this.rolesService.removeRole(+id, request.user);
  }
}
