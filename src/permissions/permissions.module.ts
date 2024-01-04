import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from 'src/roles/entities/role.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Permission, Role])],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService]
})
export class PermissionsModule {}
