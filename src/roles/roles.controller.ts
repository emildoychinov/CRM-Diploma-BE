import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AllowUnauthorizedRequest } from 'src/allow-unauthorized-request/allow-unauthorized-request.decorator';
import { UserRequest } from 'src/requests/user.request';
import { RequireSuperuser } from 'src/require-superuser/require-superuser.decorator';
import { checkAbilites } from 'src/ability/ability.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @checkAbilites({action: 'create', subject: 'role'})
  @Post('/create')
  create(@Body() createRoleDto: CreateRoleDto, @Req() request: UserRequest) {
    return this.rolesService.createRole(createRoleDto, request.user);
  }

  @checkAbilites({action: 'read', subject: 'role'})
  @Get('/all')
  findAll(@Req() request: UserRequest) {
    return this.rolesService.findRoles(request.user);
  }

  @RequireSuperuser()
  @Get('/all/:client_id')
  findAllInInstance(@Param('client_id') clientID: string){
    return this.rolesService.findAllInClient(+clientID);
  }

  @checkAbilites({action: 'read', subject: 'role'})
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: UserRequest) {
    return this.rolesService.findRole(+id, request.user);
  }

  @checkAbilites({action: 'update', subject: 'role'})
  @Patch('/update/:id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @Req() request: UserRequest) {
    return this.rolesService.update(+id, updateRoleDto, request.user);
  }

  @checkAbilites({action: 'delete', subject: 'role'})
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: UserRequest) {
    return this.rolesService.removeRole(+id, request.user);
  }
}
