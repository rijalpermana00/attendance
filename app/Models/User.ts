import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel } from '@ioc:Adonis/Lucid/Orm'
import Route from '@ioc:Adonis/Core/Route'
import Env from '@ioc:Adonis/Core/Env'
import UserLocked from 'App/Mailers/UserLocked'
import ForgotPassword from 'App/Mailers/ForgotPassword'
import { generate } from 'generate-password-ts'

export default class User extends BaseModel {
    
    static readonly STATUS_CANDIDATE :number = 0
    static readonly STATUS_ACTIVE :number = 1
    static readonly STATUS_INACTIVE :number = 2
    static readonly STATUS_LOCK :number = 3
    static readonly STATUS_SUSPEND :number = 4
    static readonly STATUS_EXPIRED :number = 5
    static readonly STATUS_FORCE_CHANGE_PASS :number = 6
    
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
    
    public async authenticate (auth:any,data:any) {

        let retries = 0;
        if(Env.get('MAX_RETRY')) retries = parseInt(Env.get('MAX_RETRY'));
        if (retries < 0) retries = 0;
        let prefix = 'phone'
        if(data?.uid.includes("@")) prefix = 'email'
        let user = await User.findByOrFail(prefix, data?.uid)
        
        try {
            
            if (!(await Hash.verify(user.password, data?.password))) {
                return {
                    code : '400',
                    info : 'Invalid password.',
                    data : null
                };
            }            

            const token = await auth.use('api').attempt(data.uid, data.password,{
                expiresIn: '10 days',
            });
            
            return {
                code:0,
                info:'success',
                data: {
                    user:user,
                    token:token
                }
            };  
            
        } catch (e) {
            
            if (e.code === 'E_INVALID_AUTH_UID' || e.code === 'E_ROW_NOT_FOUND') {
                return {
                    code : '1',
                    info : 'We cannot find any account with these credentials.',
                    data : null
                };
            }
        
            if (e.code === 'E_INVALID_AUTH_PASSWORD') {

                if(user.status_id === User.STATUS_ACTIVE || user.status_id === User.STATUS_EXPIRED){

                    if ((retries > 0) && (user.attempts >= retries)) {

                        if (user.status_id !== User.STATUS_LOCK) {
                            user.status_id = User.STATUS_LOCK;
                            user.updatedAt = DateTime.local();
                            user.save();

                            let request = {
                                'name':user.name,
                                'email':user.email,
                                'signedUrl': await this.signedUrl(user.email,'lockedAccount')
                            }

                            await new UserLocked(request).send();
                        }
                        
                        return {
                            code : '401',
                            info : 'User is Locked.',
                            data : null
                        };
                    }
                    
                    if (retries > 0) {
                        user.attempts = user.attempts + 1;
                        user.updatedAt = DateTime.local();
                        user.save();
                    }

                    return {
                        code : '400',
                        info : 'Invalid password.',
                        data : null
                    };

                }else{

                    return {
                        code : '401',
                        info : 'Unauthorized.',
                        data : null
                    };
                }
            }
        }
    }
    
    public async forgotPassword(data:any){

        if(!data?.uid){
            return {
                code : 1,
                info : 'uid is not found',
                data : null
            }
        }
        
        let prefix = 'phone'

        if(data?.uid.includes("@")) prefix = 'email'

        const user = await User.findByOrFail(prefix, data?.uid)

        if(user?.id){

            const newPassword = generate({
                length:15,
                numbers:true
            })
            
            const hashNewPassword = await Hash.make(newPassword)

            user.updatedAt = DateTime.local()
            user.password = hashNewPassword
            user.save();

            let request = {
                name : user.name,
                email : user.email,
                newPassword : newPassword
            }

            await new ForgotPassword(request).send();

        }

    }
}
