import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserConstraints1702479748585 implements MigrationInterface {
    name = 'UpdateUserConstraints1702479748585'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "client" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_480f88a019346eae487a0cd7f0c" UNIQUE ("name"), CONSTRAINT "PK_96da49381769303a6515a8785c7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "operator" ("id" SERIAL NOT NULL, "permissions" character varying NOT NULL, "client_id" integer, "user_id" integer, CONSTRAINT "REL_ba0edb808a3f9239e74221c9e4" UNIQUE ("user_id"), CONSTRAINT "PK_8b950e1572745d9f69be7748ae8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "operator_id" integer, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "REL_53f04e739105a28541dd98d88f" UNIQUE ("operator_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "operator" ADD CONSTRAINT "FK_71c4b577c2b01b5d5d8cb3406a4" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "operator" ADD CONSTRAINT "FK_ba0edb808a3f9239e74221c9e4d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_53f04e739105a28541dd98d88fd" FOREIGN KEY ("operator_id") REFERENCES "operator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_53f04e739105a28541dd98d88fd"`);
        await queryRunner.query(`ALTER TABLE "operator" DROP CONSTRAINT "FK_ba0edb808a3f9239e74221c9e4d"`);
        await queryRunner.query(`ALTER TABLE "operator" DROP CONSTRAINT "FK_71c4b577c2b01b5d5d8cb3406a4"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "operator"`);
        await queryRunner.query(`DROP TABLE "client"`);
    }

}
