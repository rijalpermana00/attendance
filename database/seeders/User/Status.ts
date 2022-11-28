import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/User/Role'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    await Role.createMany([
      {
        id: 1,
        name: 'STATUS_CANDIDATE',
      },
      {
        id: 2,
        name: 'STATUS_ACTIVE',
      },
      {
        id: 3,
        name: 'STATUS_INACTIVE',
      },
      {
        id: 4,
        name: 'STATUS_LOCK',
      },
      {
        id: 5,
        name: 'STATUS_SUSPEND',
      },
      {
        id: 6,
        name: 'STATUS_EXPIRED',
      },
      {
        id: 7,
        name: 'STATUS_FORCE_CHANGE_PASS',
      }
    ])
  }
}
