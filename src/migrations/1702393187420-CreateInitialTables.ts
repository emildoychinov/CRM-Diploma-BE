import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1702393187420 implements MigrationInterface {
    name = 'CreateInitialTables1702393187420'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "operator" ("id" SERIAL NOT NULL, "permissions" character varying NOT NULL, "clientId" integer, CONSTRAINT "PK_8b950e1572745d9f69be7748ae8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "client" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_96da49381769303a6515a8785c7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "operator" ADD CONSTRAINT "FK_71ad8c0153bacb5eca050ddcee7" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operator" DROP CONSTRAINT "FK_71ad8c0153bacb5eca050ddcee7"`);
        await queryRunner.query(`DROP TABLE "client"`);
        await queryRunner.query(`DROP TABLE "operator"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
