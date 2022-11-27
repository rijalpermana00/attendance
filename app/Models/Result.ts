import { BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class Result extends BaseModel {
  guid: number;
  code: number;
  info: any;
  data: any;
  
  constructor(guid: number,code: number,info: any,data: any){
    super();
    this.guid = guid;
    this.code = code;
    this.info = info;
    this.data = data;
  }
  
  public async toJson(){
    
    return {
      'code' : this.code,
      'info' : this.info,
      'data' : this.data
    };
  }
}
