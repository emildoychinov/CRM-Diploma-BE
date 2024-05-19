import { IsNumber } from 'class-validator';

export class CreateUserRefreshTokenDto {
  @IsNumber()
  userID: number;
}
