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
import { AuthGuard } from './guards/auth/auth.guard';
import { QueueService } from './queue/queue.service';
import { QueueModule } from './queue/queue.module';
import { BullModule } from '@nestjs/bull';
import { RedisModule } from './redis/redis.module';
import { AbilityGuard } from './guards/ability/ability.guard';
import { Operator } from './operator/entities/operator.entity';
import { User } from './user/entities/user.entity';
import { Client } from './client/entities/client.entity';
import { Permission } from './permissions/entities/permission.entity';
import { Role } from './roles/entities/role.entity';
import { CustomerModule } from './customer/customer.module';
import { ClientGuard } from './guards/client/client.guard';
import { MailModule } from './mail/mail.module';
import { ClientApiKeyModule } from './client-api-key/client-api-key.module';
import { ClientApiKey } from './client-api-key/entities/client-api-key.entity';
import { ClientApiKeyGuard } from './guards/client/api-key/client-api-key.guard';
import { SuperuserGuard } from './guards/superuser/superuser.guard';
import { OperatorService } from './operator/operator.service';
import { UserRefreshTokenModule } from './user-refresh-token/user-refresh-token.module';
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
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST' /*'DB_DEPLOYMENT_HOST'*/),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([
      Operator,
      User,
      Client,
      Permission,
      Role,
      ClientApiKey,
    ]),
    ClientModule,
    OperatorModule,
    UserModule,
    AuthModule,
    PermissionsModule,
    RolesModule,
    QueueModule,
    RedisModule,
    CustomerModule,
    MailModule,
    ClientApiKeyModule,
    UserRefreshTokenModule,
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
      useClass: SuperuserGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ClientGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ClientApiKeyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AbilityGuard,
    },
    QueueService,
  ],
})
export class AppModule {}
