import { DateTime } from 'luxon'
import { BaseModel, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Location extends BaseModel {
    @column({ isPrimary: true })
    public id: number
    
    @column()
    public name: string
    
    @column()
    public address: string
    
    @column()
    public latitude: string
    
    @column()
    public longitude: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
    
    @manyToMany(() => User, {
        pivotTable: 'location_maps',
        localKey: 'id',
        pivotForeignKey: 'location_id',
        relatedKey: 'id',
        pivotRelatedForeignKey: 'user_id',
        pivotTimestamps: true
      })
      public user: ManyToMany<typeof User>
}
