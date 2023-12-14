import { Exclude } from "class-transformer";
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
   
    @Exclude()
    @Column()
    email: string;

    @Exclude()
    @Column()
    password: string;

    
    @OneToOne(() => Operator, (operator) => operator.user, {nullable: true})
    @JoinColumn({ name: 'operator_id' })
    operator: Operator;
}