import { DateTime } from 'luxon'
import { BaseModel, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import { Status } from '../Enums/Status'
import User from './User'

export default class Shift extends BaseModel {
    @column({ isPrimary: true })
    public id: number
    
    @column()
    public name: string
    
    @column()
    public description: string
    
    @column()
    public time_in: string
    
    @column()
    public time_out: string
    
    @column()
    public status: Status

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
    
    @manyToMany(() => User, {
        pivotTable: 'shift_maps',
        pivotForeignKey: 'shift_id',
        pivotRelatedForeignKey: 'user_id',
        pivotTimestamps: true
      })
      public user: ManyToMany<typeof User>
}
