import { User } from 'src/user/entities/user.entity';
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
export class UserRefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  token: string;

  @OneToOne(() => User, (user) => user.refresh_token, { nullable: true, cascade: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
