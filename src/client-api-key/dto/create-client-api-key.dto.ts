import { IsNumber, IsString } from "class-validator";

export class CreateClientApiKeyDto {
    @IsNumber()
    public readonly clientID: number;
}
