import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';
import { IsOptional, IsString } from 'class-validator';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Operator } from 'src/operator/entities/operator.entity';
import { Client } from 'src/client/entities/client.entity';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  permissions?: Partial<Permission>[];

  @IsOptional()
  operators?: Partial<Operator>[];

  @IsOptional()
  client?: Partial<Client>;
}
