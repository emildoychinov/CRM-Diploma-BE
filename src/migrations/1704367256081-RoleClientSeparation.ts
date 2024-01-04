import { MigrationInterface, QueryRunner } from "typeorm";

export class RoleClientSeparation1704367256081 implements MigrationInterface {
    name = 'RoleClientSeparation1704367256081'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "operator_roles_role" ("operatorId" integer NOT NULL, "roleId" integer NOT NULL, CONSTRAINT "PK_c2569a6313f05c84a20fd439076" PRIMARY KEY ("operatorId", "roleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ebc9700bbccff035f5ad437a13" ON "operator_roles_role" ("operatorId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a8b67d7cad14151078af885ae3" ON "operator_roles_role" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "operator_roles_role" ADD CONSTRAINT "FK_ebc9700bbccff035f5ad437a13e" FOREIGN KEY ("operatorId") REFERENCES "operator"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "operator_roles_role" ADD CONSTRAINT "FK_a8b67d7cad14151078af885ae3f" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operator_roles_role" DROP CONSTRAINT "FK_a8b67d7cad14151078af885ae3f"`);
        await queryRunner.query(`ALTER TABLE "operator_roles_role" DROP CONSTRAINT "FK_ebc9700bbccff035f5ad437a13e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a8b67d7cad14151078af885ae3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ebc9700bbccff035f5ad437a13"`);
        await queryRunner.query(`DROP TABLE "operator_roles_role"`);
    }

}
