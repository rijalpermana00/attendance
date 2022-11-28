import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('uuid').notNullable();
      table.string('name', 255).notNullable();
      table.string('email', 255).notNullable().unique();
      table.string('phone', 100).notNullable().unique();
      table.string('password', 180).notNullable();
      table.integer('attempts').nullable();
      table.string('avatar', 255).nullable();
      table.string('language', 20).nullable();
      table.timestamp('auth_dtm').nullable();
      table.timestamp('terminate_dtm').nullable();
      table.integer('role_id').nullable();
      table.integer('status_id').nullable();
      table.timestamp('birth_date').nullable();
      table.timestamp('birth_place').nullable();
      table.string('remember_me_token').nullable();

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable();
      table.timestamp('updated_at', { useTz: true }).notNullable();
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
