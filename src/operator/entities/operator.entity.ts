import { Client } from "src/client/entities/client.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Operator {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    permissions: string;
    
    @ManyToOne(() => Client, (client) => client.operators)
    @JoinColumn({ name: 'client_id' })
    client: Client;

    @OneToOne(() => User, (user) => user.operator)
    @JoinColumn({ name: 'user_id' })
    user: User;
}