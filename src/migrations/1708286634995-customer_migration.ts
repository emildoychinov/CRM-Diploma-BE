import { MigrationInterface, QueryRunner } from "typeorm";

export class CustomerMigration1708286634995 implements MigrationInterface {
    name = 'CustomerMigration1708286634995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "customer" ("id" SERIAL NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "number" character varying NOT NULL, "account_status" character varying NOT NULL, "notes" character varying NOT NULL, "client_id" integer, CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "customer" ADD CONSTRAINT "FK_27b774a71aa86760992102731af" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "FK_27b774a71aa86760992102731af"`);
        await queryRunner.query(`DROP TABLE "customer"`);
    }

}
