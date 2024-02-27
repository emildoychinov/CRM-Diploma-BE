import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { AllowUnauthorizedRequest } from 'src/allow-unauthorized-request/allow-unauthorized-request.decorator';
import { RequireSuperuser } from 'src/require-superuser/require-superuser.decorator';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @RequireSuperuser()
  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @RequireSuperuser()
  @Get()
  findAll() {
    return this.clientService.findAll();
  }

  @RequireSuperuser()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientService.findById(+id);
  }

  @RequireSuperuser()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(+id, updateClientDto);
  }
  
  @RequireSuperuser()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientService.remove(+id);
  }
}
