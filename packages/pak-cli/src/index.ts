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
import * as update from './commands/update.js';
import * as prompts from './utils/prompts.js';
import * as vcs from '@pak/vcs';
import createClient from '@pak/bugz';
import pkg from './utils/pkg.js';
import branchUtilities from './utils/branch.js';
import applicationError from './utils/applicationerror.js';
import createStore from './utils/configurationstore.js';
import openInBrowser from './utils/openinbrowser.js';
import runTasks from './utils/tasks.js';
import makeConfigPrompts from './utils/config.js';

(async () => {
    const pkgJSON = pkg();
    const store = await createStore<StoreConfigProps>(path.join(import.meta.dirname, '../.pak'));
    const configPrompts = makeConfigPrompts(store);

    const getPakParameters = async (args: Arguments) => {       
        try {
            await configPrompts.all();
            
            const branch = await branchUtilities(vcs, store.get('username'), store.get('defaultDevBoxBranch'));
            
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
                            
                await configPrompts.filter(choices);
            }
            
            bugz.setDefaultFilter(store.get('filter'));

            return {
                prompts,
                branch,
                bugz,
                openInBrowser,
                applicationError,
                runTasks
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
            args._pak = await getPakParameters(args);
        }
    ];
    
    yargs(hideBin(process.argv))
        .scriptName(Object.keys(pkgJSON.bin)[0])
        .showHelpOnFail(true)
        .command<MiddlewareHandlerArguments>(switchCommand.cmd, switchCommand.description, switchCommand.builder, switchCommand.handler)
        .command<MiddlewareHandlerArguments>(merge.cmd, merge.description, merge.builder, merge.handler)
        .command<MiddlewareHandlerArguments>(cleanup.cmd, cleanup.description, cleanup.builder, cleanup.handler)
        .command<MiddlewareHandlerArguments>(checkout.cmd, checkout.description, checkout.builder, checkout.handler)
        .command<MiddlewareHandlerArguments>(commit.cmd, commit.description, commit.builder, commit.handler)
        .command<MiddlewareHandlerArguments>(update.cmd, update.description, update.builder, update.handler)
        .command(config.cmd, config.description, config.builder, config.makeHandler(store))   
        .middleware(middleware)     
        .showHelpOnFail(true)
        .demandCommand(1)
        .strict()
        .argv;       
})();

