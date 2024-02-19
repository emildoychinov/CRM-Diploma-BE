import { IsEmail, IsObject, IsString } from "class-validator";
import { Client } from "src/client/entities/client.entity";

export class LoginCustomerDto {
    
    @IsEmail()
    email: string;

    @IsString()
    public readonly password: string;

    @IsObject()
    public readonly client: Partial<Client>;

}