import { PartialType } from '@nestjs/mapped-types';
import { CreateClientApiKeyDto } from './create-client-api-key.dto';
import { IsNumber, IsString } from 'class-validator';

export class UpdateClientApiKeyDto extends PartialType(CreateClientApiKeyDto) {
  @IsNumber()
  public readonly clientID: number;
}
