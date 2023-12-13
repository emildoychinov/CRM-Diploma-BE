import { Client } from "src/client/entities/client.entity";
import { User } from "src/user/entities/user.entity";

export class CreateOperatorDto {
    readonly client: Client;
    readonly user: User;
    readonly permissions: string;
}
