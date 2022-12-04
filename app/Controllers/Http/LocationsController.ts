import Redis from '@ioc:Adonis/Addons/Redis';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Status } from 'App/Enums/Status';
import Location from 'App/Models/Location';
import LocationMap from 'App/Models/LocationMap';
import CreateLocationValidator from 'App/Validators/CreateLocationValidator';
import MapUserLocationValidator from 'App/Validators/MapUserLocationValidator';
import Controller from './Controller';

export default class LocationsController extends Controller{
    
    public async index ({ request }: HttpContextContract) {
        
        const req = await super.parseDataInput(request);
        let filter = 'id'
        
        switch (parseInt(req?.code)) {
            case 1:
                filter = 'name'
                break;
            case 2:
                filter  = 'address'
            default:
                break;
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
            const location = await Location.query().where(filter, req?.data.value).preload('user', (user) => {
                user.where('status', Status.ACTIVE)
            });
            
            return {
                code : 0,
                info : 'Location loaded',
                data : location
            }
            
        } catch (e) {

            return {
                code : 1,
                info : 'Failed to Load, contact your admin',
            }
        }
        
    }
    
    public async store ({ request }: HttpContextContract) {
        
        const req = await super.parseRequest(request);
        
        try {
            
            const payload = await req.validate(CreateLocationValidator)
            
            const location = new Location()

            location.name = payload.name
            location.address = payload.address
            location.latitude = payload.latitude
            location.longitude = payload.longitude
            
            const result = await location.save()
            
            if(result.id){
                
                return {
                    code : 0,
                    info : 'Location Created',
                    data : location
                }
                
            }else{
                
                return {
                    code : 1,
                    info : 'Location Failed to Save',
                    data : null
                }
            }
            
        } catch (e) {

            return {
                code : 1,
                info : 'Location Failed to Save',
                data : e
            }
        }
    }
    
    public async map({request}:HttpContextContract){
        
        const req = await super.parseRequest(request);
        
        try {
            
            const payload = await req.validate(MapUserLocationValidator)
            
            const exist = await LocationMap.query()
                .where('user_id',payload?.user_id)
                .where('location_id',payload?.location_id)
                .first()
            
            if(exist){
                
                exist.status = Status.INACTIVE
                
                await exist.save()
            }
            
            const result = await LocationMap.create({
                user_id: payload?.user_id,
                location_id: payload?.location_id      
            })
            
            // const location = await Location.find(payload?.user_id)
            
            // const result = await location?.related('user').attach([payload?.user_id])
            
            if(result.$isPersisted){
                
                return {
                    code : 0,
                    info : 'Location mapped to user',
                    data : result
                }
                
            }else{
                
                return {
                    code : 1,
                    info : 'Location Failed to map',
                    data : null
                }
            }
            
        } catch (e) {

            return {
                code : 1,
                info : 'Location Failed to map',
                data : e
            }
        }
    }
    
    public async list(){
        
        /* set redis */
        const cachedLocations = await Redis.get('location')
        
        if(cachedLocations){
            return {
                code : 0,
                info : 'Cached!',
                data : JSON.parse(cachedLocations),
            }
        }
        
        const list = await Location.query().preload('user', (user) => {
            user.where('status', Status.ACTIVE)
        });
        
        await Redis.set('location', JSON.stringify(list))
        
        /* console.log(list?.related('user')) */
        
        return {
            code : 0,
            info : 'Load From DB',
            data : list,
        }
        
    }
}
