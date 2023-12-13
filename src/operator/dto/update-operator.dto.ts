import { PartialType } from '@nestjs/mapped-types';
import { CreateOperatorDto } from './create-operator.dto';
import { Client } from 'src/client/entities/client.entity';
import { User } from 'src/user/entities/user.entity';

export class UpdateOperatorDto extends PartialType(CreateOperatorDto) {
    readonly client?: Client;
    readonly user?: User;
    permissions?: string;
}
