import { MigrationInterface, QueryRunner } from "typeorm";

export class AddApiKeys1708965979921 implements MigrationInterface {
    name = 'AddApiKeys1708965979921'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "client_api_key" ("id" SERIAL NOT NULL, "token" character varying, "access_key" integer, CONSTRAINT "UQ_e11bf89a7bd75af00f15725fdbb" UNIQUE ("token"), CONSTRAINT "REL_5e9f75b5ffe44140d9338e18cc" UNIQUE ("access_key"), CONSTRAINT "PK_f9a94955480a25be2baefeefa20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "client" ADD "access_key" integer`);
        await queryRunner.query(`ALTER TABLE "client" ADD CONSTRAINT "UQ_bfb263dbfe637239c0b60fbcd49" UNIQUE ("access_key")`);
        await queryRunner.query(`ALTER TABLE "client_api_key" ADD CONSTRAINT "FK_5e9f75b5ffe44140d9338e18ccf" FOREIGN KEY ("access_key") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client" ADD CONSTRAINT "FK_bfb263dbfe637239c0b60fbcd49" FOREIGN KEY ("access_key") REFERENCES "client_api_key"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client" DROP CONSTRAINT "FK_bfb263dbfe637239c0b60fbcd49"`);
        await queryRunner.query(`ALTER TABLE "client_api_key" DROP CONSTRAINT "FK_5e9f75b5ffe44140d9338e18ccf"`);
        await queryRunner.query(`ALTER TABLE "client" DROP CONSTRAINT "UQ_bfb263dbfe637239c0b60fbcd49"`);
        await queryRunner.query(`ALTER TABLE "client" DROP COLUMN "access_key"`);
        await queryRunner.query(`DROP TABLE "client_api_key"`);
    }

}
