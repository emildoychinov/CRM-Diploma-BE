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
import { CHANGE_STATUS_LENGTHS } from 'src/constants';
import { IsDurationKeyOfStatusLengths } from './validation/key-validator';

export class StatusDto {
  @IsString()
  reason: string;

  @IsDurationKeyOfStatusLengths()
  duration: keyof typeof CHANGE_STATUS_LENGTHS;
}
