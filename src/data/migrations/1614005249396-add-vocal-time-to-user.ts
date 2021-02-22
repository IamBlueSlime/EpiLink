import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVocalTimeToUser1614005249396 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
        ADD "vocal_time" integer
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
        DROP COLUMN "vocal_time"
    `);
  }
}
