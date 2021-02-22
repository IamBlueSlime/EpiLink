import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVoiceTimeToUser1614005249396 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
        ADD "voice_time" integer
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
        DROP COLUMN "voice_time"
    `);
  }
}
