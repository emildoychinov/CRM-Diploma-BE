import { IsNumber } from 'class-validator';

export class UpdateUserRefreshTokenDto {
  @IsNumber()
  userID: number;
}
