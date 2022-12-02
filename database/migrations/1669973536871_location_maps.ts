import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'location_maps'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').nullable();
      table.foreign('user_id').references('users.id')
      table.integer('location_id').nullable();
      table.foreign('location_id').references('locations.id')
      table.enu('status',['ACTIVE','INACTIVE']).notNullable().defaultTo('ACTIVE');

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
