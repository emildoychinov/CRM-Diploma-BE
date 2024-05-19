import { Module, forwardRef } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Operator } from 'src/operator/entities/operator.entity';
import { OperatorModule } from 'src/operator/operator.module';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { ClientApiKey } from 'src/client-api-key/entities/client-api-key.entity';
import { ClientApiKeyModule } from 'src/client-api-key/client-api-key.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => OperatorModule),
    forwardRef(() => UserModule),
    forwardRef(() => ClientApiKeyModule),
    TypeOrmModule.forFeature([Client, Operator, User, Role, ClientApiKey]),
  ],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
