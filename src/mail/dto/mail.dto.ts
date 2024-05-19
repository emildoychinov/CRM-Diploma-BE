import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { AccountStatus } from 'src/enums/customer-account-status.enum';

export class MailDto {
  @IsEmail()
  receiver: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  client: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsEnum(AccountStatus)
  status: AccountStatus;
}
