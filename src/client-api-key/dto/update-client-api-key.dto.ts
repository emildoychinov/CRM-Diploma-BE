import { PartialType } from '@nestjs/mapped-types';
import { CreateClientApiKeyDto } from './create-client-api-key.dto';

export class UpdateClientApiKeyDto extends PartialType(CreateClientApiKeyDto) {}
