import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';
import { Operator } from 'src/operator/entities/operator.entity';

export class UpdateClientDto extends PartialType(CreateClientDto) {
    name?: string;
    operators?: Operator[] | undefined;
}
