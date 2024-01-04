import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';
import { Operator } from 'src/operator/entities/operator.entity';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateClientDto extends PartialType(CreateClientDto) {
   
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsArray()
    operators?: Operator[] | undefined;
}
