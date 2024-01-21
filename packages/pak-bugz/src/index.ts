import makeAPI from './lib/api.js';
import makePost from './lib/post.js';

export default function createClient(params: {token: string, origin: string}){   
    return makeAPI(makePost(params));
}