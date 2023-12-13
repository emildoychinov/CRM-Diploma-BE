import { Operator } from "src/operator/entities/operator.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(['name'])
export class Client {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Operator, (operator) => operator.client)
    operators: Operator[];
}
