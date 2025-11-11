import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIdTenantIdToUser1762795084329 implements MigrationInterface {
  name = "AddUserIdTenantIdToUser1762795084329";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add user_id column to user table
    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN "user_id" text
    `);
    
    // Add tenant_id column to user table
    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN "tenant_id" text
    `);
    
    // Create index on user_id for performance
    await queryRunner.query(`
      CREATE INDEX "IDX_user_user_id" ON "user" ("user_id")
    `);
    
    // Create index on tenant_id for performance
    await queryRunner.query(`
      CREATE INDEX "IDX_user_tenant_id" ON "user" ("tenant_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_tenant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_user_id"`);
    
    // Remove tenant_id column from user table
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tenant_id"`);
    
    // Remove user_id column from user table
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "user_id"`);
  }
}