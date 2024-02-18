import { Client } from "src/client/entities/client.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Customer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column({nullable: false})
    email: string;

    @Column({nullable: false})
    password: string;

    @Column()
    number: string;

    @Column()
    account_status: string;

    @Column()
    notes: string;

    @ManyToOne(() => Client, (client) => client.customers, {nullable: true})
    @JoinColumn({ name: 'client_id' })
    client?: Client;

}
