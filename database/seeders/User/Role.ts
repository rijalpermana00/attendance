import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Status from 'App/Models/User/Status'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    await Status.createMany([
      {
        id: 1,
        name: 'Admin',
      },
      {
        id: 2,
        name: 'User',
      }
    ])
  }
}
