import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from './client/client.module';
import { OperatorModule } from './operator/operator.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './transform/transform.interceptor';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { CaslModule } from './casl/casl.module';
import { AuthGuard } from './auth/auth.guard';
import { QueueService } from './queue/queue.service';
import { QueueModule } from './queue/queue.module';
import { BullModule } from '@nestjs/bull';
import { RedisModule } from './redis/redis.module';
import { AbilityGuard } from './ability/ability.guard';
import { Operator } from './operator/entities/operator.entity';
import { User } from './user/entities/user.entity';
import { Client } from './client/entities/client.entity';
import { Permission } from './permissions/entities/permission.entity';
import { Role } from './roles/entities/role.entity';
import { CustomerModule } from './customer/customer.module';
import { ClientGuard } from './client/client.guard';
require('events').EventEmitter.defaultMaxListeners = 0;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        }, 
      })
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Operator, User, Client, Permission, Role]),
    ClientModule,
    OperatorModule,
    UserModule,
    AuthModule,
    PermissionsModule,
    RolesModule,
    CaslModule,
    QueueModule,
    RedisModule,
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AbilityGuard
    },
    {
      provide: APP_GUARD,
      useClass: ClientGuard
    },
    QueueService,
  ],
})
export class AppModule {}