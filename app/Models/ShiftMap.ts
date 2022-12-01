import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { Status } from '../Enums/Status'

export default class ShiftMap extends BaseModel {
  public static table = 'shift_maps'
  
  @column({ isPrimary: true })
  public id: number
  
  @column()
  public user_id: number
  
  @column()
  public shift_id: number
  
  @column()
  public status: Status

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
