
export default class Controller {
    
    public async parseRequest(request){
        
        let req = request.only(['code','info','data']);
        let data = JSON.parse(req.data);
        request.updateBody(data);
        
        return request;
    }
    
    public async parseDataInput(request){
        
        let req = request.only(['code','info','data']);
        
        if(req?.data){

            var data = JSON.parse(req.data);
            
            return {
                code : req?.code,
                info : req?.info,
                data : data
            }

        }else{
            
            return {
                code : 99,
                info : 'Json is not valid',
                data : null
            };
        }
        
    }
    
    public async checkAlphabet(value){
        const regExp = /[a-zA-Z]/g;
        
        if(regExp.test(value)){
            return true
        }
        
        return false

    }
}