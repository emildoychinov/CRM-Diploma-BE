import { Customer } from "src/customer/entities/customer.entity";
import { Operator } from "src/operator/entities/operator.entity";
import { Role } from "src/roles/entities/role.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

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
}

