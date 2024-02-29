import { MigrationInterface, QueryRunner } from "typeorm";

export class TestMigration1709118775716 implements MigrationInterface {
    name = 'TestMigration1709118775716'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "client_api_key" ("id" SERIAL NOT NULL, "token" character varying, "client_id" integer, CONSTRAINT "UQ_e11bf89a7bd75af00f15725fdbb" UNIQUE ("token"), CONSTRAINT "REL_138ccb6a0f207e6a11595e8705" UNIQUE ("client_id"), CONSTRAINT "PK_f9a94955480a25be2baefeefa20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customer" ("id" SERIAL NOT NULL, "first_name" character varying, "last_name" character varying, "email" character varying NOT NULL, "password" character varying NOT NULL, "number" character varying, "account_status" character varying, "notes" character varying, "client_id" integer NOT NULL, CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "permission" ("id" SERIAL NOT NULL, "action" character varying NOT NULL, "subject" character varying NOT NULL, "conditions" character varying, CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "client_id" integer, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "refresh_token" character varying, "operator_id" integer, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "REL_53f04e739105a28541dd98d88f" UNIQUE ("operator_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "operator" ("id" SERIAL NOT NULL, "client_id" integer, CONSTRAINT "PK_8b950e1572745d9f69be7748ae8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "client" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_480f88a019346eae487a0cd7f0c" UNIQUE ("name"), CONSTRAINT "PK_96da49381769303a6515a8785c7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role_permissions_permission" ("roleId" integer NOT NULL, "permissionId" integer NOT NULL, CONSTRAINT "PK_b817d7eca3b85f22130861259dd" PRIMARY KEY ("roleId", "permissionId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`CREATE TABLE "operator_roles_role" ("operatorId" integer NOT NULL, "roleId" integer NOT NULL, CONSTRAINT "PK_c2569a6313f05c84a20fd439076" PRIMARY KEY ("operatorId", "roleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ebc9700bbccff035f5ad437a13" ON "operator_roles_role" ("operatorId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a8b67d7cad14151078af885ae3" ON "operator_roles_role" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "client_api_key" ADD CONSTRAINT "FK_138ccb6a0f207e6a11595e87052" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer" ADD CONSTRAINT "FK_27b774a71aa86760992102731af" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role" ADD CONSTRAINT "FK_7ec8b66943c6444ee369282c922" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_53f04e739105a28541dd98d88fd" FOREIGN KEY ("operator_id") REFERENCES "operator"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "operator" ADD CONSTRAINT "FK_71c4b577c2b01b5d5d8cb3406a4" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "operator_roles_role" ADD CONSTRAINT "FK_ebc9700bbccff035f5ad437a13e" FOREIGN KEY ("operatorId") REFERENCES "operator"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "operator_roles_role" ADD CONSTRAINT "FK_a8b67d7cad14151078af885ae3f" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operator_roles_role" DROP CONSTRAINT "FK_a8b67d7cad14151078af885ae3f"`);
        await queryRunner.query(`ALTER TABLE "operator_roles_role" DROP CONSTRAINT "FK_ebc9700bbccff035f5ad437a13e"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`ALTER TABLE "operator" DROP CONSTRAINT "FK_71c4b577c2b01b5d5d8cb3406a4"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_53f04e739105a28541dd98d88fd"`);
        await queryRunner.query(`ALTER TABLE "role" DROP CONSTRAINT "FK_7ec8b66943c6444ee369282c922"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "FK_27b774a71aa86760992102731af"`);
        await queryRunner.query(`ALTER TABLE "client_api_key" DROP CONSTRAINT "FK_138ccb6a0f207e6a11595e87052"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a8b67d7cad14151078af885ae3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ebc9700bbccff035f5ad437a13"`);
        await queryRunner.query(`DROP TABLE "operator_roles_role"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`DROP TABLE "role_permissions_permission"`);
        await queryRunner.query(`DROP TABLE "client"`);
        await queryRunner.query(`DROP TABLE "operator"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TABLE "permission"`);
        await queryRunner.query(`DROP TABLE "customer"`);
        await queryRunner.query(`DROP TABLE "client_api_key"`);
    }

}
