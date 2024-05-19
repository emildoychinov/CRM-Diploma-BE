import {
  IsEmail,
  IsEnum,
  IsInstance,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Client } from 'src/client/entities/client.entity';
import { AccountStatus } from '../../enums/customer-account-status.enum';

export class CreateCustomerDto {
  @IsEmail()
  email: string;

  @IsString()
  public readonly password: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  number: string;

  @IsOptional()
  notes: string;

  @IsObject()
  public readonly client: Partial<Client>;
}
