import { Module, forwardRef } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { OperatorController } from './operator.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Operator } from './entities/operator.entity';
import { ConfigModule } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { Client } from 'src/client/entities/client.entity';
import { JwtModule } from '@nestjs/jwt';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Role } from 'src/roles/entities/role.entity';

@Module({
  imports: [ConfigModule, JwtModule, forwardRef(() => UserModule), TypeOrmModule.forFeature([Operator, User, Client, Permission, Role])],
  controllers: [OperatorController],
  providers: [OperatorService],
  exports: [OperatorService]
})
export class OperatorModule {}
