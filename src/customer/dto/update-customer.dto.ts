import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Client } from 'src/client/entities/client.entity';
import { AccountStatus } from '../../enums/customer-account-status.enum';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
    
    @IsOptional()
    @IsEmail()
    email: string;
    
    @IsOptional()
    @IsString()
    public readonly password: string;
    
    @IsOptional()
    number: string;

    @IsOptional()
    account_status: AccountStatus;

    @IsOptional()
    notes: string;
    

}
