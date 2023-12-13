import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Operator } from 'src/operator/entities/operator.entity';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

//Updates manageable only by certain roles
export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsNumber()
    public readonly userID: number;
    @IsEmail()
    public readonly email?: string;
    @IsString()
    public readonly password?: string;
    @IsNotEmpty()
    public readonly operator?: Operator;
}
