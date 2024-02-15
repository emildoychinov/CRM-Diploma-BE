import { Module, forwardRef } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Role } from './entities/role.entity';
import { Client } from 'src/client/entities/client.entity';
import { Operator } from 'src/operator/entities/operator.entity';
import { ClientModule } from 'src/client/client.module';
import { OperatorModule } from 'src/operator/operator.module';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { QueueService } from 'src/queue/queue.service';
import { RolesListener } from './roles.listener';

@Module({
  imports: [
    ConfigModule, 
    forwardRef(() => ClientModule), 
    forwardRef(() => OperatorModule), 
    forwardRef(() => PermissionsModule), 
    TypeOrmModule.forFeature([Role, Permission, Client ,Operator])],
  controllers: [RolesController],
  providers: [QueueService, RolesService, RolesListener],
  exports: [RolesService]
})
export class RolesModule {}
