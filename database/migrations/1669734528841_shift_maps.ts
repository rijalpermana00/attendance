import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'shift_maps'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').nullable();
      table.foreign('user_id').references('users.id')
      table.integer('shift_id').nullable();
      table.foreign('shift_id').references('shifts.id')
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
