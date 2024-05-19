import { Exclude } from 'class-transformer';
import { Client } from 'src/client/entities/client.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['token'])
export class ClientApiKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  token: string;

  @OneToOne(() => Client, (client) => client.api_key, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;
}
