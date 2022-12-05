import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUser from 'App/Mailers/CreateUser'
import { Roles } from 'App/Enums/Roles';
import { UserStatus } from 'App/Enums/UserStatus';
import Redis from '@ioc:Adonis/Addons/Redis';
import Controller from './Controller';
import RegisterUserValidator from 'App/Validators/RegisterUserValidator';
import { Status } from 'App/Enums/Status';

export default class UsersController extends Controller {
  
    public async register ({ request, auth }: HttpContextContract) {

        const req = await super.parseRequest(request);

        try {

            const payload = await req.validate(RegisterUserValidator)
        
            const user = new User()

            user.name = payload.name
            user.email = payload.email
            user.phone = payload.phone
            user.role_id = Roles.USER
            user.avatar = (typeof payload.pictures !== 'undefined') ? payload.pictures : null
            user.language = (typeof payload.language !== 'undefined') ? payload.language : 'en'
            user.status_id = UserStatus.ACTIVE
            user.password = payload.password
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
                const cachedUsers = await Redis.get('users')
                
                if(cachedUsers){
                    
                    const lists = JSON.parse(cachedUsers)
                    lists.push(user);
                    await Redis.set('users', JSON.stringify(lists))
                    
                }

                return {
                    code : 0,
                    info : 'User Created',
                    data : await auth.use('api').login(user, {
                        expiresIn: '1 day',
                    })
                };

            }else{

                return {
                    code : 1,
                    info :'failed to create user',
                    data :null
                }
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

        const req = await super.parseDataInput(request);

        try {
            
            const user = new User();
            const result = await user.authenticate(auth,req?.data);

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
                data : e.info,
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
        
        const req = await super.parseDataInput(request);

        try {
            
            const user = new User();
            const result = await user.forgotPassword(req?.data);
            return result;

        } catch (e) {
            
            return {
                code : 99,
                info : e.code,
                data : e.info,
            }
        }
    }
    
    public async list({request}: HttpContextContract){
        
        let req = request.only(['code','info','data']);
        console.log(req.data)
        
        try {
            
            const cachedUsers = await Redis.get('users')
            if(cachedUsers){
                return {
                    code : 0,
                    info : 'Cached!',
                    data : JSON.parse(cachedUsers),
                }
            }
            
            const user = new User();
            const list = await user.list()
            
            await Redis.set('users', JSON.stringify(list))
            
            return {
                code : 0,
                info : 'Load From DB',
                data : list,
            }
            
        } catch (e) {
            
            return {
                code : 99,
                info : e.code,
                data : e.info,
            }
        }
    }
    
    public async get({ request }: HttpContextContract) {
        
        const req = await super.parseDataInput(request);
        let filter = 'id'
        
        if(parseInt(req?.code) === 1) {
            filter = 'name'
        }
        
        if(typeof req?.data?.value === 'undefined'){
            return {
                code : 400,
                info : 'sorry, value cannot be empty',
            }
        }
        
        if(filter === 'id'){
            const alphabet = await super.checkAlphabet(req?.data.value);
            
            if(alphabet){
                
                return {
                    code : 400,
                    info : 'Check your code and value combination',
                }
            }
        }
        
        // try{
            const shift = await User.query().where(filter, req?.data.value).preload('location', (location) => {
                location.where('location_maps.status', Status.ACTIVE)
            }).preload('shift', (location) => {
                location.where('shift_maps.status', Status.ACTIVE)
            });
            
            return {
                code : 0,
                info : 'User loaded',
                data : shift
            }
            
        // } catch (e) {

        //     return {
        //         code : 1,
        //         info : 'Failed to Load, contact your admin',
        //         data : e
        //     }
        // }
        
    }
}
