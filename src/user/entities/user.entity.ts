import { Exclude } from 'class-transformer';
import { Operator } from 'src/operator/entities/operator.entity';
import { UserRefreshToken } from 'src/user-refresh-token/entities/user-refresh-token.entity';
import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['username'])
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  username: string;

  @Exclude()
  @Column({ nullable: false })
  email: string;

  @Exclude()
  @Column({ nullable: false })
  password: string;

  @OneToOne(() => Operator, (operator) => operator.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'operator_id' })
  operator?: Operator;

  @OneToOne(() => UserRefreshToken, (refresh_token) => refresh_token.user, {
    nullable: true,
    eager: true,
  })
  refresh_token?: UserRefreshToken;
}
