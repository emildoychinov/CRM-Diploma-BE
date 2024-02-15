import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthUserDto } from './dto/auth-user.dto';
import { AllowUnauthorizedRequest } from 'src/allow-unauthorized-request/allow-unauthorized-request.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @AllowUnauthorizedRequest()
  login(@Body() authUserDto: AuthUserDto): Promise<any> {
    return this.authService.login(authUserDto);
  }
}