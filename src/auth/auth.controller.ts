import { Body, Controller, Get, Post, Req, Request, UseGuards } from '@nestjs/common';
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
    return this.authService.loginOperator(authUserDto);
  }

  @Get('refresh')
  refresh(@Req() request: any){
    return this.authService.refreshTokens(request.user.sub, 
      request.user.refreshToken)
  }

  @Get('logout')
  logout(@Req() request: any){
    request.user.refreshToken = null;
    return this.authService.logout(request.user.sub);
  }
}