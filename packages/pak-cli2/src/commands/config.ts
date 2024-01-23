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

export function makeHandler(store: StoreConfig, questions: QuestionsFunc){  
    return async (args: any) => {
        if(Object.keys(args).length > 2){
            console.log('nope');
            await setByInput(args);
            return
        }

        await askAndAnswer();
    };

    async function setByInput(input: any){
        if(input.username){
            await store.set('username', input.username);
        }

        if(input.branch){
            await store.set('branch', input.branch);
        }

        if(input.token){
            await store.set('token', input.token);
        }

        if(input.origin){
            await store.set('origin', input.origin);
        }
    }

    async function askAndAnswer(){
        if(!store.has('username')){
            await store.set('username', await questions.username())
        }

        if(!store.has('branch')){
            await store.set('branch', await questions.branch())
        }

        if(!store.has('token')){
            await store.set('token', await questions.token())
        }

        if(!store.has('origin')){
            await store.set('origin', await questions.origin());
        }
    }
}   