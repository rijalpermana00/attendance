import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/User/Role'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    await Role.createMany([
      {
        id: 1,
        name: 'ACTIVE',
      },
      {
        id: 2,
        name: 'SUSPEND',
      },
      {
        id: 3,
        name: 'BANNED',
      },
    ])
  }
}
