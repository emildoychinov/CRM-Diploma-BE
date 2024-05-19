import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Operator } from 'src/operator/entities/operator.entity';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';

//Updates manageable only by certain roles
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEmail()
  @IsOptional()
  public readonly email?: string;

  @IsString()
  @IsOptional()
  public readonly password?: string;

  @IsOptional()
  public readonly operator?: Partial<Operator>;

  @IsOptional()
  public readonly refreshToken?: string | null;
}
