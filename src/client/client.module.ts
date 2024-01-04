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

@Module({
  imports: [
    ConfigModule, 
    forwardRef(() => OperatorModule), 
    forwardRef(() => UserModule), 
    TypeOrmModule.forFeature([Client, Operator, User, Role])
  ],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService]
})
export class ClientModule {}
