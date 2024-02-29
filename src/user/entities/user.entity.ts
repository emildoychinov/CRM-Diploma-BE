import { Exclude } from "class-transformer";
import { Operator } from "src/operator/entities/operator.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn, Unique } from "typeorm";

@Entity()
@Unique(['username'])
@Unique(['email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    username: string;
   
    @Exclude()
    @Column({nullable: false})
    email: string;

    @Exclude()
    @Column({nullable: false})
    password: string;
    
    @OneToOne(() => Operator, (operator) => operator.user, {nullable: true, onDelete: "CASCADE"})
    @JoinColumn({ name: 'operator_id' })
    operator?: Operator;

    @Column({nullable: true})
    refresh_token?: string;

}