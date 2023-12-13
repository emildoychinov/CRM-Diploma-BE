import { Operator } from "src/operator/entities/operator.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn, Unique } from "typeorm";

@Entity()
@Unique(['username'])
@Unique(['email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @OneToOne(() => Operator, (operator) => operator.user)
    @JoinColumn({ name: 'operator_id' })
    operator: Operator;
}