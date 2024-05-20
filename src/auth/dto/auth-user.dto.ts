import { IsEmail, IsString } from 'class-validator';

//Creating users only manageable by certain roles
export class AuthUserDto {
  @IsEmail()
  public readonly email: string;
  @IsString()
  public readonly password: string;
}
