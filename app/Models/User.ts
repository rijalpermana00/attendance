import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel } from '@ioc:Adonis/Lucid/Orm'
import Route from '@ioc:Adonis/Core/Route'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string
  
  @column()
  public phone: string
  
  @column()
  public email: string
  
  @column({ serializeAs: null })
  public role_id: number
  
  @column({ serializeAs: null })
  public password: string
  
  @column()
  public language: string
  
  @column({ serializeAs: null })
  public status_id: number
  
  @column()
  public avatar: string
  
  @column({ serializeAs: null })
  public attempts: number
  
  @column({ serializeAs: null })
  public auth_dtm: DateTime
  
  @column({ serializeAs: null })
  public terminate_dtm: DateTime
  
  @column()
  public remember_me_token: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
      if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
      }
  }

  public async signedUrl(email:any,command:any = 'verifyEmail'){

      const signedUrl = Route.builder().params({
          email: email,
      }).makeSigned(command,{
          expiresIn: '30m',
      })

      return signedUrl;
  }
}
