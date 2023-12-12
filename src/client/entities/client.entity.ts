import { Operator } from "src/operator/entities/operator.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Client {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Operator, (operator) => operator.client)
        operators: Operator[];
}
