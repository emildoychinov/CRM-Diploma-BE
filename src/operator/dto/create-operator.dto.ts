import { IsArray, IsOptional, IsString } from "class-validator";
import { Client } from "src/client/entities/client.entity";
import { Role } from "src/roles/entities/role.entity";
import { User } from "src/user/entities/user.entity";

export class CreateOperatorDto {
    @IsOptional()
    public readonly client: Client;
    @IsOptional()
    public readonly user: User;
    
    @IsOptional()
    @IsArray()
    public readonly roles: Role[];
}
