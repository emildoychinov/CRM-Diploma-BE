import { PartialType } from '@nestjs/mapped-types';
import { CreateOperatorDto } from './create-operator.dto';
import { Client } from 'src/client/entities/client.entity';
import { User } from 'src/user/entities/user.entity';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOperatorDto extends PartialType(CreateOperatorDto) {

    @IsOptional()
    public readonly client?: Client;
    @IsOptional()
    public readonly user?: User;
    @IsString()
    @IsOptional()
    public readonly permissions?: string;
}
