import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ShiftsController {
    
    public async index ({ request, auth }: HttpContextContract) {
     
        let req = request.only(['code','info','data']);
        console.log(req);
        
    }
}
