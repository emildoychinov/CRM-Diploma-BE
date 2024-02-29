import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { AllowUnauthorizedRequest } from 'src/decorators/allow-unauthorized-request/allow-unauthorized-request.decorator';
import { StatusDto } from 'src/customer-status/dto/status.dto';
import { RequireApiKey } from 'src/decorators/require-api-key/require-api-key.decorator';
import { UserRequest } from 'src/interfaces/requests/user.request';
import { RequireSuperuser } from 'src/decorators/require-superuser/require-superuser.decorator';
import { checkAbilites } from 'src/decorators/ability/ability.decorator';
import { SubjectActions } from 'src/enums/subject-actions.enum';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}
  
  @RequireApiKey()
  @Post('auth/register')
  register(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.register(createCustomerDto);
  }

  @RequireApiKey()
  @Post('auth/login')
  login(@Body() loginCustomerDto: LoginCustomerDto) {
    return this.customerService.login(loginCustomerDto);
  }

  @RequireApiKey()
  @Patch('/deactivate/:id')
  deactivate(@Param('id') id: string){
    return this.customerService.deactivate(+id);
  }

  @checkAbilites({action: SubjectActions.READ, subject: 'customer'})
  @Get('/all')
  findAll(@Req() request: UserRequest) {
    return this.customerService.findCustomers(request.user);
  }

  @RequireSuperuser()
  @Get('/all/:client_id')
  findAllInClient(@Param('client_id') clientID: string) {
    return this.customerService.findAllInClient(+clientID)
  }

  @checkAbilites({action: SubjectActions.READ, subject: 'customer'})
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: UserRequest) {
    return this.customerService.findCustomerById(+id, request.user);
  }

  @checkAbilites({action: SubjectActions.UPDATE, subject: 'customer'})
  @Patch('ban/:id')
  ban(@Param('id') id: string, @Body() statusDto: StatusDto, @Req() request: UserRequest){
    return this.customerService.ban(+id, request.user, statusDto)
  }
  
  @checkAbilites({action: SubjectActions.UPDATE, subject: 'customer'})
  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @Req() request: UserRequest) {
    return this.customerService.update(+id, request.user, updateCustomerDto);
  }

  @checkAbilites({action: SubjectActions.DELETE, subject: 'customer'})
  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() request: UserRequest) {
    return this.customerService.removeCustomer(+id, request.user);
  }
}
