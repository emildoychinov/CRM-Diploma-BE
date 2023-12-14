import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString, isNotEmpty } from "class-validator";
import { Operator } from "src/operator/entities/operator.entity";

//Creating users only manageable by certain roles
export class CreateUserDto {
    @IsString()
    public readonly username: string;
    @IsEmail()
    public readonly email: string;
    @IsString()
    public readonly password: string;
    @IsOptional()
    public readonly operator: Partial<Operator>
}

