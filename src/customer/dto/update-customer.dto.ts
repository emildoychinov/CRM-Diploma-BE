import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Client } from 'src/client/entities/client.entity';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
    
    @IsOptional()
    @IsEmail()
    email: string;
    
    @IsOptional()
    @IsString()
    public readonly password: string;
    
    @IsOptional()
    firstName?: string;

    @IsOptional()
    lastName?: string;

    @IsOptional()
    number: string;

    @IsOptional()
    account_status: string;

    @IsOptional()
    notes: string;
    
    @IsOptional()
    public readonly client: Client;

}
