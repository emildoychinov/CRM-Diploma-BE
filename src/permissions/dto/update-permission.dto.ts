import { PartialType } from '@nestjs/mapped-types';
import { CreatePermissionDto } from './create-permission.dto';
import { IsOptional, IsString } from 'class-validator';
import { Role } from 'src/roles/entities/role.entity';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  @IsString()
  action: string;

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  conditions?: string;
}
