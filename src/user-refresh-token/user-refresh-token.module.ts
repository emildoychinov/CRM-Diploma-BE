import { Module, forwardRef } from '@nestjs/common';
import { UserRefreshTokenService } from './user-refresh-token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { UserRefreshToken } from './entities/user-refresh-token.entity';
import { ClientModule } from 'src/client/client.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    JwtModule,
    TypeOrmModule.forFeature([UserRefreshToken]),
  ],
  providers: [UserRefreshTokenService],
  exports: [UserRefreshTokenService],
})
export class UserRefreshTokenModule {}
