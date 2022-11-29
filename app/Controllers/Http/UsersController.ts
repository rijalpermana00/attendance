import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import CreateUser from 'App/Mailers/CreateUser'
import { Roles } from 'App/Enums/Roles';

export default class UsersController {
  
    public async register ({ request, auth }: HttpContextContract) {
        /**
         * Validate user details
         */

        let req = request.only(['code','info','data']);
        let data = JSON.parse(req.data);
        
        const validationSchema = schema.create({
            name: schema.string({ trim: true }),
            phone: schema.string({ trim: true }, [
                rules.unique({ table: 'users', column: 'phone' }),
            ]),
            email: schema.string({ trim: true }, [
                rules.email(),
                rules.unique({ table: 'users', column: 'email' }),
            ]),
            password: schema.string({ trim: true }, [
                rules.confirmed(),
            ]),
        })

        try {

            const userValidation = await validator.validate({
                schema: validationSchema,
                data: data,
            })
        
            const user = new User()

            user.name = userValidation.name
            user.phone = userValidation.phone
            user.email = userValidation.email
            user.role_id = Roles.USER
            user.avatar = (typeof data.pictures !== 'undefined') ? data.pictures : null
            user.language = (typeof data.language !== 'undefined') ? data.language : 'en'
            user.status_id = User.ACTIVE
            user.password = userValidation.password
            const result = await user.save()
            
            if(result.id){

                let request = {
                    'name':user.name,
                    'email':user.email,
                    'signedUrl': await user.signedUrl(user.email,'verifyEmail')
                }

                /* Send Email */
                await new CreateUser(request).send();
                
                /* set redis */
                // let setRedis = await Redis.set('user_' + user.uuid, JSON.stringify(user))
                // console.log(setRedis)

                return {
                    code : 0,
                    info : 'User Created',
                    data : await auth.use('api').login(user, {
                        expiresIn: '10m',
                    })
                };

            }else{

                return {'code':1,'info':'User failed to created','data':null};
            }

        } catch (e) {

            return {
                code : 1,
                info : 'create user failed',
                data : e.message
            }
        }
        
    }
    public async login ({ auth, request }: HttpContextContract) {

        let req = request.only(['code','info','data']);

        if(req?.data){

            var data = JSON.parse(req.data);

        }else{
            
            return {
                code : 99,
                info : 'Json is not valid',
                data : null
            };
        }
        
        try {
            
            const user = new User();
            const result = await user.authenticate(auth,data);

            return result;

        } catch (e) {
            
            if (e.code === 'E_INVALID_AUTH_UID' || e.code === 'E_ROW_NOT_FOUND') {
                return {
                    code : 401,
                    info : 'We cannot find any account with these credentials.',
                    data : null
                };
            }
            
            return {
                code : 415,
                info : e.code,
                data : e,
            }
        }
    }

    public async index({ auth }: HttpContextContract){
        
        try {
            
            await auth.use('api').check();
            
            if (auth.use('api').isLoggedIn) {
                return {
                    code : 0,
                    info : 'hello '+auth?.user?.name,
                    data : auth?.user
                }
            }else{
                return {
                    code : 401,
                    info : 'hello stranger',
                    data : null
                }
            }

            
        } catch (e) {
            
            if(e.code == 'E_INVALID_AUTH_SESSION'){
                return {
                    code : 401,
                    info : 'hello stranger',
                    data : null
                }
            }
        }
    }

    public async logout({auth}: HttpContextContract){

        await auth.use('api').revoke()
        
        return {
            code : 401,
            info : 'hello stranger',
            data : null
        }
    }

    public async forgotPassword({request}: HttpContextContract){
        
        let req = request.only(['code','info','data']);

        if(req?.data){

            var data = JSON.parse(req.data);

        }else{
            
            return {
                code : 415,
                info : 'Json is not valid',
                data : null
            };
        }

        try {
            
            const user = new User();
            const result = await user.forgotPassword(data);
            return result;

        } catch (e) {
            
            return {
                code : 99,
                info : e.code,
                data : e,
            }
        }
    }
}
