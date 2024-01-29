#!/usr/bin/env node
import path from 'path';
import yargs, {Arguments, Argv} from 'yargs';
import { hideBin } from 'yargs/helpers';
import { MiddlewareHandlerArguments, StoreConfigProps } from './types.js';
import * as switchCommand from './commands/switch.js';
import * as config from './commands/config.js';
import * as checkout from './commands/checkout.js';
import * as commit from './commands/commit.js';
import * as cleanup from './commands/cleanup.js';
import * as merge from './commands/merge.js';
import * as prompts from './utils/prompts.js';
import * as vcs from '@pak/vcs';
import createClient from '@pak/bugz';
import pkg from './utils/pkg.js';
import branchUtilities from './utils/branch.js';
import makeLogger from './utils/logger.js';
import applicationError from './utils/applicationerror.js';
import createStore from './utils/configurationstore.js';

(async () => {
    const pkgJSON = pkg();
    const store = await createStore<StoreConfigProps>(path.join(import.meta.dirname, '../.pak'));

    const getPakParameters = async (args: Arguments) => {       
        try {
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

            
            const branch = await branchUtilities(vcs, store.get('username'));
            
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

            const logger = makeLogger(!!args.quiet, !!args.verbose);

            return {
                prompts,
                branch,
                bugz,
                logger
            };
        } catch (error) {
            applicationError(error);
        }
    }
          
    const middleware = [
        async () => {
            if (!await vcs.isRepo()) {
                applicationError('Not a git repository (or any of the parent directories)');
            }
        },
        async (args: Arguments) => {
            if(args._.includes('config')){
                return;
            }

            args._pak = await getPakParameters(args);
        }
    ];
    
    yargs(hideBin(process.argv))
        .scriptName(Object.keys(pkgJSON.bin)[0])
        .showHelpOnFail(true)
        .command<MiddlewareHandlerArguments>(switchCommand.cmd, switchCommand.description, wrapDefaultOptions(switchCommand.builder), switchCommand.handler)
        .command<MiddlewareHandlerArguments>(merge.cmd, merge.description, wrapDefaultOptions(merge.builder), merge.handler)
        .command<MiddlewareHandlerArguments>(cleanup.cmd, cleanup.description, wrapDefaultOptions(cleanup.builder), cleanup.handler)
        .command<MiddlewareHandlerArguments>(checkout.cmd, checkout.description, wrapDefaultOptions(checkout.builder), checkout.handler)
        .command<MiddlewareHandlerArguments>(commit.cmd, commit.description, wrapDefaultOptions(commit.builder), commit.handler)
        .command(config.cmd, config.description, config.builder, config.makeHandler(store))   
        .middleware(middleware)     
        .showHelpOnFail(true)
        .demandCommand(1)
        .strict()
        .argv;       
})();

    function wrapDefaultOptions(builder: (yargs: Argv) => void){
        return (yargs: Argv) => {
            builder(yargs)

            yargs
                .options({
                    'v': {
                        alias: 'verbose',
                        type: 'boolean',
                        description: 'Display more logging',
                        default: false
                    },
                    'q': {
                        alias: 'quiet',
                        type: 'boolean',
                        description: 'No logs',
                        default: false
                    }
                });  
        }
    };