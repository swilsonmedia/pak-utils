#!/usr/bin/env node
import path from 'path';
import yargs, {Arguments} from 'yargs';
import { hideBin } from 'yargs/helpers';
import pkg from './utils/pkg.js';
import createStore from './utils/configurationstore.js';
import * as switchCommand from './commands/switch.js';
import * as config from './commands/config.js';
import * as checkout from './commands/checkout.js';
import * as commit from './commands/commit.js';
import * as cleanup from './commands/cleanup.js';
import * as merge from './commands/merge.js';
import * as prompts from './utils/prompts.js';
import * as vcs from '@pak/vcs';
import branchUtilities from './utils/branch.js';
import versionControlUtilities from './utils/versioncontrol.js';
import createClient from '@pak/bugz';
import { MiddlewareHandlerArguments, StoreConfigProps } from './types.js';

(async () => {
    const pkgJSON = pkg();
    const store = await createStore<StoreConfigProps>(path.join(import.meta.dirname, '../.pak'));

    const getPakParameters = async () => {
        const listBranches = async () => await vcs.listBranches(true);
        
        if(!store.has('username')){
            await store.set('username', await prompts.input({
                message: 'What username do you use for GIT branching?'
            }));
        }

        if(!store.has('token')){
            await store.set('token', await prompts.input({
                message: 'What is your FogBugz API access token?'
            }));
        }

        if(!store.has('origin')){
            await store.set('origin', await prompts.input({
                message: 'What is the URL origin of your FogBugz website?'
            }));
        }

        const branch = branchUtilities(listBranches, `users/${store.get('username')}/fb-`);
        
        const bugz = createClient({
            token: store.get('token'),
            origin: store.get('origin')
        });

        if(!store.has('filter')){
            const choices = (await bugz.listFilters())
                            .filter((f: any) => f.type === 'saved')
                            .map((f: any) => ({
                                name: f.text,
                                value: f.sFilter
                            }));
                        
            const selectedFilter = await prompts.select({
                message: 'What is the FogBugz saved filter you monitor for cases?',
                choices
            })
            
            await store.set('filter', selectedFilter.toString());
        }
        
        bugz.setDefaultFilter(store.get('filter'));

        const defaultBranch = await branch.defaultBranchName();

        if(!defaultBranch){
            console.error('Could not find default branch name');
            process.exit(1);
        }

        const versionControl = versionControlUtilities(vcs, defaultBranch);

        return {
            prompts,
            branch,
            bugz,
            versionControl
        };
    }
          
    const middleware = [
        async () => {
            if (!await vcs.isRepo()) {
                console.error('\nNot a git repository (or any of the parent directories)\n');
                process.exit(1);
            }
        },
        async (args: Arguments) => {
            if(args._.includes('config')){
                return;
            }

            args._pak = await getPakParameters();
        }
    ];
    
    yargs(hideBin(process.argv))
        .scriptName(Object.keys(pkgJSON.bin)[0])
        .showHelpOnFail(true)
        .command<MiddlewareHandlerArguments>(switchCommand.cmd, switchCommand.description, switchCommand.builder, switchCommand.handler)
        .command<MiddlewareHandlerArguments>(cleanup.cmd, cleanup.description, cleanup.builder, cleanup.handler)
        .command<MiddlewareHandlerArguments>(checkout.cmd, checkout.description, checkout.builder, checkout.handler)
        .command<MiddlewareHandlerArguments>(commit.cmd, commit.description, commit.builder, commit.handler)
        .command<MiddlewareHandlerArguments>(merge.cmd, merge.description, merge.builder, merge.makeHandler(cleanup.makeCleanup))
        .command(config.cmd, config.description, config.builder, config.makeHandler(store))   
        .middleware(middleware)     
        .showHelpOnFail(true)
        .demandCommand(1)
        .strict()
        .argv;       
})();

