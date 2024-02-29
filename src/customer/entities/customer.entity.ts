import { Exclude } from "class-transformer";
import { Client } from "src/client/entities/client.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Customer {
    @PrimaryGeneratedColumn()
    id: number;

    @Exclude()
    @Column({nullable: true})
    first_name: string;

    @Exclude()
    @Column({nullable: true})
    last_name: string;
    
    @Exclude()
    @Column({nullable: false})
    email: string;

    @Exclude()
    @Column({nullable: false})
    password: string;

    @Exclude()
    @Column({nullable: true})
    number: string;

    @Column({nullable: true})
    account_status: string;
    
    @Column({nullable: true})
    notes: string;

    @ManyToOne(() => Client, (client) => client.customers, {nullable: false})
    @JoinColumn({ name: 'client_id' })
    client: Client;

}

