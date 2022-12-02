
export default class Controller {
    
    public async parseInput(request){
        
        let req = request.only(['code','info','data']);
        let data = JSON.parse(req.data);
        request.updateBody(data);
        
        return request;
    }
}