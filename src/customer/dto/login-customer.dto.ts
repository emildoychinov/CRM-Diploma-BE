import { IsEmail, IsObject, IsOptional, IsString } from 'class-validator';
import { Client } from 'src/client/entities/client.entity';

export class LoginCustomerDto {
  @IsEmail()
  email: string;

  @IsString()
  public readonly password: string;

  @IsOptional()
  @IsObject()
  public client: Partial<Client>;
}
