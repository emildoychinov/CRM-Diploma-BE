import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { AllowUnauthorizedRequest } from 'src/allow-unauthorized-request/allow-unauthorized-request.decorator';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}
  
  @Post('auth/register')
  register(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.register(createCustomerDto);
  }

  @Post('auth/login')
  login(@Body() loginCustomerDto: LoginCustomerDto) {
    return this.customerService.login(loginCustomerDto);
  }


  @Get()
  findAll(@Req() request: any) {
    return this.customerService.findAll(request.user.client_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: any) {
    return this.customerService.findByIdAndClient(+id, request.user.client_id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @Req() request: any) {
    return this.customerService.update(+id, request.user.client_id,  updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }
}
