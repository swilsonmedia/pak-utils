import { Argv } from "yargs";
import { StoreConfig } from "../types.js";
import applicationError from "../utils/applicationerror.js";
import makeConfigPrompts from "../utils/config.js";

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
    return async ({ username, token, origin, filter, _pak: {bugz}}: any) => {
        try {
            if(!username && !token && !origin && !filter){
                const config = makeConfigPrompts(store);
                const choices = (await bugz.listFilters())
                    .filter((f: any) => f.type === 'saved')
                    .map((f: any) => ({
                        name: f.text,
                        value: f.sFilter
                    }));

                await config.all(choices);
            }

            if(username){
                await store.set('username', username);
            }

            if(token){
                await store.set('token', token);
            }

            if(origin){
                await store.set('origin', origin);
            }

            if(filter){
                await store.set('filter', filter);
            }
        } catch (error) {
            applicationError(error);
        }
    };
}   