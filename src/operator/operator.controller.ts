import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { AbilityGuard } from 'src/guards/ability/ability.guard';
import { checkAbilites } from 'src/decorators/ability/ability.decorator';
import { AllowUnauthorizedRequest } from 'src/decorators/allow-unauthorized-request/allow-unauthorized-request.decorator';
import { UserRequest } from 'src/requests/user.request';
import { RequireSuperuser } from 'src/decorators/require-superuser/require-superuser.decorator';

@Controller('operator')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @checkAbilites({ action: 'create', subject: 'operator' })
  @Post()
  create(@Body() createOperatorDto: CreateOperatorDto,  @Req() request: UserRequest) {
    return this.operatorService.createOperator(createOperatorDto, request.user);
  }

  @checkAbilites({ action: 'read', subject: 'operator' })
  @Get('/all')
  findAll(@Req() request: UserRequest) {
    return this.operatorService.findAllOperators(request.user);
  }

  @RequireSuperuser()
  @Get('/all/:client_id')
  findAllInClient(@Param('client_id') clientID: string){
    return this.operatorService.findAllInClient(+clientID);
  }

  @checkAbilites({ action: 'read', subject: 'operator' })
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: UserRequest) {
    return this.operatorService.findOneOperator(+id, request.user);
  }

  @checkAbilites({ action: 'update', subject: 'operator' })
  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateOperatorDto: UpdateOperatorDto, @Req() request: UserRequest) {
    return this.operatorService.update(+id, updateOperatorDto, request.user);
  }

  @checkAbilites({ action: 'delete', subject: 'operator'})
  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() request: UserRequest) {
    return this.operatorService.removeOperator(+id, request);
  }
}
