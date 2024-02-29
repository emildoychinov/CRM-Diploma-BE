import { IsOptional, IsString } from "class-validator";
import { Role } from "src/roles/entities/role.entity";

export class CreatePermissionDto {
    @IsString()
    action: string;

    @IsString()
    subject: string;

    @IsString()
    conditions: string;

    @IsOptional()
    roles?: Role[];

}
