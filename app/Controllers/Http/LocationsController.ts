import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Location from 'App/Models/Location';
import CreateLocationValidator from 'App/Validators/CreateLocationValidator';
import Controller from './Controller';

export default class LocationsController extends Controller{
    
    public async store ({ request }: HttpContextContract) {
        
        const req = await super.parseInput(request);
        
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
                    data : location
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
}
