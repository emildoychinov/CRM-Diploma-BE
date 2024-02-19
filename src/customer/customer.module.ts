import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { Customer } from './entities/customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { QueueService } from 'src/queue/queue.service';
import { StatusListener } from 'src/customer-status/status.listener';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [MailModule, AuthModule, JwtModule, TypeOrmModule.forFeature([Customer])],
  controllers: [CustomerController],
  providers: [QueueService, CustomerService, StatusListener],
})
export class CustomerModule {}
