import { Role } from "src/roles/entities/role.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    action: string;

    @Column()
    subject: string;

    @Column({nullable : true})
    conditions?: string;

    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[];
}
