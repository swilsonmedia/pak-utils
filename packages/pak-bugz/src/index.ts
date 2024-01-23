import makeAPI from './lib/api.js';
import makePost from './lib/post.js';

export default function createClient(params: {token: string, origin: string}){   
    if(!params.token){
        throw new Error('createClient expects a token')
    }
    
    if(!params.origin){
        throw new Error('createClient expects a origin')
    }
    
    return makeAPI(makePost(params));
}