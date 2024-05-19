import { Client } from 'src/client/entities/client.entity';
import { Role } from 'src/roles/entities/role.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Operator {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client, (client) => client.operators, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client?: Client;

  @OneToOne(() => User, (user) => user.operator, {
    nullable: true,
    eager: true,
  })
  user?: User;

  @ManyToMany(() => Role, (role) => role.operators, { nullable: true })
  @JoinTable()
  roles?: Role[];
}
