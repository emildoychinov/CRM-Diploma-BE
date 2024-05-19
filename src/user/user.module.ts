import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Operator } from 'src/operator/entities/operator.entity';
import { OperatorModule } from 'src/operator/operator.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => OperatorModule),
    TypeOrmModule.forFeature([Operator, User]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
