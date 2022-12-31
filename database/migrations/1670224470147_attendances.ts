import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'attendances'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamp('work_time').notNullable();
      table.string('work_description', 200).nullable();
      table.timestamp('off_time').nullable();
      table.string('off_description', 200).nullable();
      table.integer('user_id').notNullable();
      table.foreign('user_id').references('users.id')
      table.integer('location_id').notNullable();
      table.foreign('location_id').references('locations.id')
      table.string('latitude', 20).nullable();
      table.string('longitude', 20).nullable();

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
