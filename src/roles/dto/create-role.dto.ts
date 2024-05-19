import { IsOptional, IsString } from 'class-validator';
import { Client } from 'src/client/entities/client.entity';
import { Operator } from 'src/operator/entities/operator.entity';
import { Permission } from 'src/permissions/entities/permission.entity';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsOptional()
  permissions?: Partial<Permission>[];

  @IsOptional()
  operators?: Partial<Operator>[];

  @IsOptional()
  client?: Partial<Client>;
}
