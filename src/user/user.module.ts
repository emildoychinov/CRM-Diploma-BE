import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Operator } from 'src/operator/entities/operator.entity';
import { OperatorModule } from 'src/operator/operator.module';

@Module({
  imports: [ConfigModule, OperatorModule, TypeOrmModule.forFeature([User, Operator])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
