import { Module, forwardRef } from '@nestjs/common';
import { ClientApiKeyService } from './client-api-key.service';
import { ClientApiKeyController } from './client-api-key.controller';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ClientApiKey } from './entities/client-api-key.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientModule } from 'src/client/client.module';

@Module({
  imports: [
    forwardRef(() => ClientModule),
    AuthModule,
    JwtModule,
    TypeOrmModule.forFeature([ClientApiKey]),
  ],
  controllers: [ClientApiKeyController],
  providers: [ClientApiKeyService],
  exports: [ClientApiKeyService],
})
export class ClientApiKeyModule {}
