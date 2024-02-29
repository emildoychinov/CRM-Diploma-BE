import { PartialType } from '@nestjs/mapped-types';
import { CreateOperatorDto } from './create-operator.dto';
import { Client } from 'src/client/entities/client.entity';
import { User } from 'src/user/entities/user.entity';
import { IsOptional, IsString } from 'class-validator';
import { Role } from 'src/roles/entities/role.entity';

export class UpdateOperatorDto extends PartialType(CreateOperatorDto) {

    @IsOptional()
    public readonly user?: User;
    @IsOptional()
    public readonly role?: Role;
}
