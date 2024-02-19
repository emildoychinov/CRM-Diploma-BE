import { MigrationInterface, QueryRunner } from "typeorm";

export class NullableValues1708336343428 implements MigrationInterface {
    name = 'NullableValues1708336343428'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "FK_27b774a71aa86760992102731af"`);
        await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "client_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer" ADD CONSTRAINT "FK_27b774a71aa86760992102731af" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "FK_27b774a71aa86760992102731af"`);
        await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "client_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer" ADD CONSTRAINT "FK_27b774a71aa86760992102731af" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
