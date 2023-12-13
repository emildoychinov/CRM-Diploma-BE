import { IsArray, IsString } from "class-validator";
import { Operator } from "src/operator/entities/operator.entity";

export class CreateClientDto {
    @IsString()
    public readonly name: string;

    @IsArray()
    public readonly operators: Operator[];
}
