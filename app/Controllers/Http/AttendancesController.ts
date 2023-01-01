import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Attendance from 'App/Models/Attendance';
import { DateTime } from 'luxon';
import Controller from "./Controller";

export default class AttendancesController extends Controller{
    
    public async index ({ request }: HttpContextContract) {
        
        const payload = await super.parseDataInput(request);
        
        try{
            
            return payload
            
        } catch (e) {
            console.log(e)
            return {
                code : 1,
                info : 'Failed to Load, contact your admin',
            }
        }
        
    }
    
    public async checkIn ({ request,auth }: HttpContextContract) {
        
        const payload = await super.parseDataInput(request);
        
        try{
            
            const userId = auth?.user?.id;
            
            if(!userId){
                
                return {
                    code : 415,
                    info : 'Not Authenticated'
                }
            }
            
            let date = DateTime.now().toFormat('yyyy-MM-dd')
            
            if(payload?.data?.date){
                
               date = payload?.data?.date; 
            }
            
            const attendance:any = await Attendance.query().where('user_id',userId).whereRaw('work_time::date = ?',[date]).pojo().first();
            
            if(attendance){
                
                return {
                    
                    code : 403,
                    info : 'You already check in today'
                }
                
            }
            
            const result = await Attendance.create({
                workTime: DateTime.now(),
                workDescription: payload?.data?.desc,
                userId: userId,
                locationId: payload?.data?.locId,
                latitude: payload?.data?.latitude,
                longitude: payload?.data?.longitude,
            })
            
            return{
                code : 0,
                info : 'Check In Success',
                data : result
            }
            
        } catch (e) {
            console.log(e)
            return {
                code : 1,
                info : 'Failed to save, contact your admin',
            }
        }
        
    }
    
    public async checkOut ({ request,auth }: HttpContextContract) {
        
        const payload = await super.parseDataInput(request);
        
        try{
            
            const userId = auth?.user?.id;
            
            if(!userId){
                
                return {
                    code : 415,
                    info : 'Not Authenticated'
                }
            }
            
            let date = DateTime.now().toFormat('yyyy-MM-dd')
            
            if(payload?.data?.date){
                
               date = payload?.data?.date; 
            }
            
            const attendance = await Attendance.query().where('user_id',userId).whereRaw('work_time::date = ?',[date]).first();
            
            if(!attendance){
                return{
                    code : 403,
                    info : 'You haven`t check in today'
                }
            }
            
            if(attendance?.offTime){
                
                return {
                    
                    code : 403,
                    info : 'You already check out today'
                }
                
            }
            
            attendance.offTime =  DateTime.now();
            attendance.offDescription = payload?.data?.desc;
            
            const result = await attendance.save();
            
            return{
                code : 0,
                info : 'Check Out Success',
                data : result
            }
            
        } catch (e) {
            console.log
            return {
                code : 1,
                info : 'Failed to save, contact your admin',
            }
        }
        
    }
}
