import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ClientApiKeyService } from './client-api-key.service';
import { CreateClientApiKeyDto } from './dto/create-client-api-key.dto';
import { UpdateClientApiKeyDto } from './dto/update-client-api-key.dto';
import { RequireSuperuser } from 'src/decorators/require-superuser/require-superuser.decorator';

@Controller('client-api')
export class ClientApiKeyController {
  constructor(private readonly clientApiKeyService: ClientApiKeyService) {}

  @RequireSuperuser()
  @Get('refresh/:id')
  refreshKey(@Param('id') id: number) {
    return this.clientApiKeyService.refreshKey({
      clientID: id,
    } as UpdateClientApiKeyDto);
  }

  @RequireSuperuser()
  @Delete('delete/:id')
  deleteKey(@Param('id') id: number) {
    return this.clientApiKeyService.deleteKey(id);
  }
}
