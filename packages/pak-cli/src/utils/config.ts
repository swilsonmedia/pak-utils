import {StoreConfig} from "../types.js";
import * as prompts from './prompts.js'

export default function makeConfigPrompts(store: StoreConfig){
        const username = async () => {
            await store.set('username', await prompts.input({
                message: 'What username do you use for GIT branching?'
            }));
        };

        const token = async () => {
            await store.set('token', await prompts.input({
                message: 'What is your FogBugz API access token?'
            }));
        };

        const origin = async () => {
            await store.set('origin', await prompts.input({
                message: 'What is the URL origin of your FogBugz website?'
            }));
        };

        const filter = async (choices: []) => {
            const selectedFilter = await prompts.select({
                message: 'What is the FogBugz saved filter you want monitor for cases?',
                choices
            })
            
            await store.set('filter', selectedFilter.toString());
        };

        const defaultDevBoxBranch = async () => {
            const answer = await prompts.confirm({message: 'Are you a Front End Developer with a virtual machine as a dev box?', default: false});

            if(!answer){
                await store.set('defaultDevBoxBranch', '');
                return;
            }

            await store.set('defaultDevBoxBranch', await prompts.input({
                message: 'What is the default branch used on your developer environment? (ex: "fed/defaultfordev10")'
            }));
        }

    return {
        username,
        token,
        origin,
        filter,
        defaultDevBoxBranch,
        all: async (choices?: []) => {
            if(!store.has('username')){
                await username();
            }

            if(!store.has('token')){
                await token();
            }

            if(!store.has('origin')){
                await origin();
            }

            if(!store.has('filter') && choices){
                await filter(choices);
            }

            if(!store.has('defaultDevBoxBranch')){
                await defaultDevBoxBranch();
            }
        }
    }
}