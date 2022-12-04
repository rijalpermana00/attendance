import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, validator } from '@ioc:Adonis/Core/Validator'
import { Status } from 'App/Enums/Status';
import Shift from 'App/Models/Shift';
import ShiftMap from 'App/Models/ShiftMap';
import Controller from './Controller';

export default class ShiftsController extends Controller{
    
    public async index ({ request }: HttpContextContract) {
        
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
        
        try{
            const shift = await Shift.query().where(filter, req?.data.value).preload('user', (user) => {
                user.where('status', Status.ACTIVE)
            });
            
            return {
                code : 0,
                info : 'Location loaded',
                data : shift
            }
            
        } catch (e) {

            return {
                code : 1,
                info : 'Failed to Load, contact your admin',
            }
        }
        
    }
    
    public async store({request}: HttpContextContract){
        
        let req = request.only(['code','info','data']);
        let data = JSON.parse(req?.data);
        
        const validationSchema = schema.create({
            name: schema.string({ trim: true }),
            time_in: schema.string({ trim: true }),
            time_out: schema.string({ trim: true }),
        })
        
        try {

            const shiftValidation = await validator.validate({
                schema: validationSchema,
                data: data,
            })
        
            const shift = new Shift()

            shift.name = shiftValidation.name
            shift.description = data?.desc
            shift.time_in = shiftValidation.time_in
            shift.time_out = shiftValidation.time_out
            
            const result = await shift.save()
            
            if(result.id){

                return {
                    code : 0,
                    info : 'Shift Created',
                    data : result
                };

            }else{

                return {
                    code : 1,
                    info : 'create shift failed',
                    data : null
                }
            }

        } catch (e) {

            return {
                code : 1,
                info : 'create shift failed',
                data : e.message
            }
        }
    }
    
    public async map({request}:HttpContextContract){
        
        let req = request.only(['code','info','data']);
        let data = JSON.parse(req?.data);
        
        const validationSchema = schema.create({
            user_id: schema.number(),
            shift_id: schema.number(),
        })
        
        try {

            const mapValidation = await validator.validate({
                schema: validationSchema,
                data: data,
            })
            
            const mapper = new ShiftMap()
            
            mapper.user_id = mapValidation.user_id
            mapper.shift_id = mapValidation.shift_id
            
            const result = await mapper.save()
            
            if(result.id){

                return {
                    code : 0,
                    info : 'User mapped to Shift',
                    data : result
                };

            }else{

                return {
                    code : 1,
                    info : 'user and shift fail to mapped',
                    data : null
                }
            }
            
            
        } catch (e) {

            return {
                code : 1,
                info : 'user and shift fail to mapped',
                data : e.message
            }
        }
    }
}
