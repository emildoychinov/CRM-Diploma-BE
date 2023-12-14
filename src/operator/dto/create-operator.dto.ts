import { IsOptional, IsString } from "class-validator";
import { Client } from "src/client/entities/client.entity";
import { User } from "src/user/entities/user.entity";

export class CreateOperatorDto {
    @IsOptional()
    public readonly client: Client;
    @IsOptional()
    public readonly user: User;
    @IsString()
    public readonly permissions: string;
}
