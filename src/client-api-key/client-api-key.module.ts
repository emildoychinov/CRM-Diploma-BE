import { Module } from '@nestjs/common';
import { ClientApiKeyService } from './client-api-key.service';
import { ClientApiKeyController } from './client-api-key.controller';

@Module({
  controllers: [ClientApiKeyController],
  providers: [ClientApiKeyService],
})
export class ClientApiKeyModule {}
