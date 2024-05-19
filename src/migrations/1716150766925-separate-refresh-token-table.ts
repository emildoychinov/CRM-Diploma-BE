import { MigrationInterface, QueryRunner } from "typeorm";

export class SeparateRefreshTokenTable1716150766925 implements MigrationInterface {
    name = 'SeparateRefreshTokenTable1716150766925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_refresh_token" ("id" SERIAL NOT NULL, "token" character varying, "user_id" integer, CONSTRAINT "UQ_cca1dbcca742456cf24913a0abf" UNIQUE ("token"), CONSTRAINT "REL_24e64309aedf1c04d857a456df" UNIQUE ("user_id"), CONSTRAINT "PK_2f86bb87603956e017efa2e74ec" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refresh_token"`);
        await queryRunner.query(`ALTER TABLE "user_refresh_token" ADD CONSTRAINT "FK_24e64309aedf1c04d857a456dfc" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_refresh_token" DROP CONSTRAINT "FK_24e64309aedf1c04d857a456dfc"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "refresh_token" character varying`);
        await queryRunner.query(`DROP TABLE "user_refresh_token"`);
    }

}
