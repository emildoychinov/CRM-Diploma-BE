import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClientApiKeyService } from './client-api-key.service';
import { CreateClientApiKeyDto } from './dto/create-client-api-key.dto';
import { UpdateClientApiKeyDto } from './dto/update-client-api-key.dto';

@Controller('client-api-key')
export class ClientApiKeyController {
  constructor(private readonly clientApiKeyService: ClientApiKeyService) {}

  @Post()
  create(@Body() createClientApiKeyDto: CreateClientApiKeyDto) {
    return this.clientApiKeyService.create(createClientApiKeyDto);
  }

  @Get()
  findAll() {
    return this.clientApiKeyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientApiKeyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientApiKeyDto: UpdateClientApiKeyDto) {
    return this.clientApiKeyService.update(+id, updateClientApiKeyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientApiKeyService.remove(+id);
  }
}
