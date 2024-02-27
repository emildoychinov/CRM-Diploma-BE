import { Exclude } from "class-transformer";
import { ClientApiKey } from "src/client-api-key/entities/client-api-key.entity";
import { Customer } from "src/customer/entities/customer.entity";
import { Operator } from "src/operator/entities/operator.entity";
import { Role } from "src/roles/entities/role.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(['name'])
export class Client {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    name: string;

    @OneToMany(() => Operator, (operator) => operator.client, {nullable: true})
    operators?: Operator[];

    @OneToMany(() => Customer, (customer) => customer.client, {nullable: true})
    customers?: Customer[];

    @OneToMany(() => Role, (role) => role.client, {nullable: true})
    roles?: Role[];

    @OneToOne(() => ClientApiKey, (api_key) => api_key.client, {nullable: true})
    @JoinColumn({ name: 'access_key' })
    api_key: ClientApiKey;
}

