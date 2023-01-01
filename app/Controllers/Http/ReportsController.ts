import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Controller from './Controller';

export default class ReportsController extends Controller{
    
    public async index ({ request }: HttpContextContract) {
        
        await super.parseDataInput(request);
        
        // try{
        //     const location = await Location.query().where(filter, req?.data.value).preload('user', (user) => {
        //         user.where('status', Status.ACTIVE)
        //     });
            
        //     return {
        //         code : 0,
        //         info : 'Location loaded',
        //         data : location
        //     }
            
        // } catch (e) {

        //     return {
        //         code : 1,
        //         info : 'Failed to Load, contact your admin',
        //     }
        // }
        
    }
}
