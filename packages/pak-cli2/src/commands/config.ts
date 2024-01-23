import { Argv } from "yargs";

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
            }
        });   
}

export function makeHandler(store: StoreReturnType<StoreConfig>, {select, input, confirm}: prompts.All){  
    return async (args: any) => {
        let input = {
            ...args
        };        

        if(Object.keys(input).length <= 2){
            if(!await wantToContinue()){
                return;
            }

            input = await questions();             
        }

        if(input.username){
            await store.set('USERNAME', input.username);
        }

        if(input.branch){
            await store.set('DEFAULT_BRANCH', input.branch);
        }

        if(input.token){
            await store.set('API_TOKEN', input.token);
        }

        if(input.origin){
            await store.set('API_ORIGIN', input.origin);
        }
    };

    async function wantToContinue(){
        console.log('');
        return await confirm({message: 'Missing config entries, want to provide answers now?'});
    }
    
    async function questions(){
        console.log('');
        const username = await input({
            message: 'What username would you like to use in GIT branches?'
        });

        console.log('');
        const branch = await select({
            message: 'What is the default GIT branch?',
            choices: ['main', 'master']
        });

        console.log('');
        const token = await input({
            message: 'What is your FogBugz API access token?'
        });

        console.log('');
        const origin = await input({
            message: 'What is then website origin of the FogBugz site you are using?',
        });

        return {
            username,
            branch,
            token,
            origin
        }
    }
}   