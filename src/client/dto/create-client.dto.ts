import { IsArray, IsOptional, IsString } from "class-validator";
import { Operator } from "src/operator/entities/operator.entity";

export class CreateClientDto {
    @IsString()
    public readonly name: string;

    @IsOptional()
    @IsArray()
    public readonly operators: Partial<Operator>[];
}
