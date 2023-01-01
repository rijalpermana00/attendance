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
            
            const attendance = await Attendance.query().where('user_id',userId).whereRaw('work_time::date = ?',[date]).first();
            
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
    
    public async report ({ request }: HttpContextContract) {
        
        const payload = await super.parseDataInput(request);
        
        try{
            
            let startDate = DateTime.now().toFormat('yyyy-MM-dd')
            let endDate = DateTime.now().plus({month: 1}).toFormat('yyyy-MM-dd')
            
            if(payload?.data){
                startDate = payload?.data?.startDate;
                endDate = payload?.data?.endDate;
            }
            
            const attendance = await Attendance.query().whereRaw('created_at::date >= ? and created_at::date < ?',[startDate,endDate]).preload('user')
            
            const report = await this.mapReport(attendance);
            
            return {
                code: 0,
                info: "Success",
                data: report
            }
            
        } catch (e) {
            
            console.log(e)
            return {
                code : 1,
                info : 'Failed to Load, contact your admin',
            }
        }
        
    }
    
    public async detail ({ request }: HttpContextContract) {
        
        const payload = await super.parseDataInput(request);
        
        try{
            
            let startDate = DateTime.now().toFormat('yyyy-MM-dd')
            let endDate = DateTime.now().plus({month: 1}).toFormat('yyyy-MM-dd')
            
            if(payload?.data){
                startDate = payload?.data?.startDate;
                endDate = payload?.data?.endDate;
            }
            
            const attendance = await Attendance.query().whereRaw('created_at::date >= ? and created_at::date < ?',[startDate,endDate]).preload('user')
            
            return {
                code: 0,
                info: "Success",
                data: attendance
            }
            
        } catch (e) {
            
            console.log(e)
            return {
                code : 1,
                info : 'Failed to Load, contact your admin',
            }
        }
        
    }
    
    public async mapReport(attendance:Attendance[]){
        
        let report = new Map();
            
        attendance.forEach(element => {
            if(report.has(element?.user?.name)){
                const value = report.get(element?.user?.name)["counter"]
                report.get(element?.user?.name)["counter"] = (value || 0) + 1 
            }else{
                report.set(element?.user?.name, {
                    counter:1
                })
            }
        });
        
        const result = Array.from(report).map(([name,v]) => {
            return ({name,...v});
        })
        
        return result;
    }
}
