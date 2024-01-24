import {Prompts} from "../types.js";

export default function getQuestions({input, select}: Prompts){
    async function username(){
        return await input({
            message: 'What username would you like to use in GIT branches?',
        });
    }

    async function branch(){
        return await select({
            message: 'What is the default GIT branch?',
            choices: ['main', 'master']
        });
    }

    async function token(){
        return await input({
            message: 'What is your FogBugz API access token?',
        });
    }

    async function origin(){
        return await input({
            message: 'What is then website origin of the FogBugz site you are using?',
        });
    }

    return {
        username,
        branch,
        token,
        origin
    }
}