import { Argv } from "yargs";
import { StoreConfig } from "../types.js";
import applicationError from "../utils/applicationerror.js";

export const cmd = 'config'

export const description = 'Set config properties';

export function builder(yargs: Argv){
    yargs
        .usage('pak config')
        .options({
            'u': {
                alias: 'username',
                type: 'string',
                description: 'The username used in GIT branch names.  ex: users/{username}/fb-12345'
            },
            'b': {
                alias: 'branch',
                type: 'string',
                description: 'Default branch name. Common are "master" or "main"'
            },
            't': {
                alias: 'token',
                type: 'string',
                description: 'The FogBugz API access token'
            },
            'o': {
                alias: 'origin',
                type: 'string',
                description: 'The origin part of your FogBugz site.  Ex:  http://www.fogbugz.com'
            },
            'f': {
                alias: 'filter',
                type: 'string',
                description: 'The FogBugz filter you want to get case results for'
            },
        });   
}

export function makeHandler(store: StoreConfig){  
    return async (args: any) => {
        if(Object.keys(args).length <= 2){
            applicationError('No arguments were passed. Please see "pak config --help" to see the what are available.');
        }

        if(args.username){
            await store.set('username', args.username);
        }

        if(args.token){
            await store.set('token', args.token);
        }

        if(args.origin){
            await store.set('origin', args.origin);
        }

        if(args.filter){
            await store.set('filter', args.filter);
        }
    };
}   