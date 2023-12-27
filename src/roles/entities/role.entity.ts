import { Operator } from "src/operator/entities/operator.entity";
import { Permission } from "src/permissions/entities/permission.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    name: string;

    @ManyToMany(() => Permission, (permission) => permission.roles, {eager: true, nullable: true})
    @JoinTable()
    permissions?: Permission[];

    @ManyToMany(() => Operator, (operator) => operator.roles, {nullable: true})
    operators?: Operator[];
}
