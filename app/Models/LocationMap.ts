import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { Status } from 'App/Enums/Status'

export default class LocationMap extends BaseModel {
  @column({ isPrimary: true })
  public id: number
  
  @column()
  public user_id: number
  
  @column()
  public location_id: number
  
  @column()
  public status: Status

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
