import { MigrationInterface, QueryRunner } from "typeorm";

export class OneToOneFix1709070126814 implements MigrationInterface {
    name = 'OneToOneFix1709070126814'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client_api_key" DROP CONSTRAINT "FK_5e9f75b5ffe44140d9338e18ccf"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_53f04e739105a28541dd98d88fd"`);
        await queryRunner.query(`ALTER TABLE "operator" DROP CONSTRAINT "FK_ba0edb808a3f9239e74221c9e4d"`);
        await queryRunner.query(`ALTER TABLE "client" DROP CONSTRAINT "FK_bfb263dbfe637239c0b60fbcd49"`);
        await queryRunner.query(`ALTER TABLE "client_api_key" RENAME COLUMN "access_key" TO "client_id"`);
        await queryRunner.query(`ALTER TABLE "operator" DROP CONSTRAINT "REL_ba0edb808a3f9239e74221c9e4"`);
        await queryRunner.query(`ALTER TABLE "operator" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "client" DROP CONSTRAINT "UQ_bfb263dbfe637239c0b60fbcd49"`);
        await queryRunner.query(`ALTER TABLE "client" DROP COLUMN "access_key"`);
        await queryRunner.query(`ALTER TABLE "client_api_key" ADD CONSTRAINT "FK_138ccb6a0f207e6a11595e87052" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_53f04e739105a28541dd98d88fd" FOREIGN KEY ("operator_id") REFERENCES "operator"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_53f04e739105a28541dd98d88fd"`);
        await queryRunner.query(`ALTER TABLE "client_api_key" DROP CONSTRAINT "FK_138ccb6a0f207e6a11595e87052"`);
        await queryRunner.query(`ALTER TABLE "client" ADD "access_key" integer`);
        await queryRunner.query(`ALTER TABLE "client" ADD CONSTRAINT "UQ_bfb263dbfe637239c0b60fbcd49" UNIQUE ("access_key")`);
        await queryRunner.query(`ALTER TABLE "operator" ADD "user_id" integer`);
        await queryRunner.query(`ALTER TABLE "operator" ADD CONSTRAINT "REL_ba0edb808a3f9239e74221c9e4" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "client_api_key" RENAME COLUMN "client_id" TO "access_key"`);
        await queryRunner.query(`ALTER TABLE "client" ADD CONSTRAINT "FK_bfb263dbfe637239c0b60fbcd49" FOREIGN KEY ("access_key") REFERENCES "client_api_key"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "operator" ADD CONSTRAINT "FK_ba0edb808a3f9239e74221c9e4d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_53f04e739105a28541dd98d88fd" FOREIGN KEY ("operator_id") REFERENCES "operator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client_api_key" ADD CONSTRAINT "FK_5e9f75b5ffe44140d9338e18ccf" FOREIGN KEY ("access_key") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
