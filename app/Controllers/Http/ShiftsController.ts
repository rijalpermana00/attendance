import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, validator } from '@ioc:Adonis/Core/Validator'
import { Status } from 'App/Enums/Status';
import Shift from 'App/Models/Shift';
import ShiftMap from 'App/Models/ShiftMap';
import MapUserShiftValidator from 'App/Validators/MapUserShiftValidator';
import Controller from './Controller';

export default class ShiftsController extends Controller{
    
    public async index ({ request }: HttpContextContract) {
        
        const req = await super.parseDataInput(request);
        let filter = 'id'
        let value = req?.data?.value
        
        if(parseInt(req?.code) === 1) {
            filter = 'name'
        }
        
        switch (parseInt(req?.code)) {
            case 1:
                filter = 'name'
                break;
            case 2:
                filter = 'user'
                break;
            default:
                filter = 'id'
                break;
        }
        
        if(typeof value === 'undefined'){
            return {
                code : 400,
                info : 'sorry, value cannot be empty',
            }
        }
        
        if(filter === 'id'){
            const alphabet = await super.checkAlphabet(value);
            
            if(alphabet){
                
                return {
                    code : 400,
                    info : 'Check your code and value combination',
                }
            }
        }
            
        if(filter === 'user'){
            const shiftMap = await ShiftMap.query().where('user_id',value).where('status',Status.ACTIVE).first();
            
            if(!shiftMap){
                return {
                    code : 404,
                    info : 'Shift Not Found',
                }
            }
            
            filter = 'id'
            value = shiftMap.shift_id;
        }
        
        try{
            
            const shift = await Shift.query().where(filter, value);
            
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
        
        const req = await super.parseRequest(request);
        
        try {
            
            const payload = await req.validate(MapUserShiftValidator)
            
            const exist = await ShiftMap.query()
                .where('user_id',payload?.user_id)
                .where('shift_id',payload?.shift_id)
                .first()
            
            if(exist){
                
                exist.status = Status.INACTIVE
                
                await exist.save()
            }
            
            const result = await ShiftMap.create({
                user_id: payload?.user_id,
                shift_id: payload?.shift_id      
            })
            
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
            console.log(e)
            return {
                code : 1,
                info : 'user and shift fail to mapped',
                data : e.message
            }
        }
    }
}
