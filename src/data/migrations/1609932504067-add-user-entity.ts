import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserEntity1609932504067 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user" (
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "discord_id" character varying,
        "microsoft_id" character varying NOT NULL,
        "microsoft_login" character varying NOT NULL,
        CONSTRAINT "PK:USER:UUID" PRIMARY KEY ("uuid"),
        CONSTRAINT "UQ:USER:MICROSOFT_ID" UNIQUE ("microsoft_id"),
        CONSTRAINT "UQ:USER:MICROSOFT_LOGIN" UNIQUE ("microsoft_login")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
