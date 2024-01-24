#!/usr/bin/env node
import path from 'path';
import yargs, {Arguments} from 'yargs';
import { hideBin } from 'yargs/helpers';
import pkg from './utils/pkg.js';
import getQuestions from './utils/configquestions.js';
import createStore from './utils/configurationstore.js';
import * as switchCommand from './commands/switch.js';
import * as config from './commands/config.js';
import * as checkout from './commands/checkout.js';
import * as commit from './commands/commit.js';
import makeCleanUpCommand from './commands/cleanup.js';
import * as merge from './commands/merge.js';
import * as prompts from './utils/prompts.js';
import * as vcs from '../../pak-vcs/dist/index.js';
import * as branch from './utils/branch.js';
import createClient from 'pak-bugz';
import checkForConfigOptions from './utils/checkforconfigoptions.js';
import {MiddlewareHandlerArguments, StoreConfigProps } from './types.js';

(async () => {
    const pkgJSON = pkg();
    const store = await createStore<StoreConfigProps>(path.join(import.meta.dirname, '../.pak'));
    const questions = getQuestions(prompts);

    const cleanupBranch = makeCleanUpCommand({
        select: prompts.select,
        vcs,
        branch,
        bugzClient: createClient
    });
    
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

            args.userSettings = await checkForConfigOptions(store, questions);
        }
    ];
    
    yargs(hideBin(process.argv))
        .scriptName(Object.keys(pkgJSON.bin)[0])
        .showHelpOnFail(true)
        .command<MiddlewareHandlerArguments>(switchCommand.cmd, switchCommand.description, switchCommand.builder, switchCommand.makeHandler({
            select: prompts.select,
            vcs,
            branch,
            bugzClient: createClient
        }))
        .command<MiddlewareHandlerArguments>(cleanupBranch.cmd, cleanupBranch.description, cleanupBranch.builder, cleanupBranch.handler)
        .command<MiddlewareHandlerArguments>(checkout.cmd, checkout.description, checkout.builder, checkout.makeHandler({
            select: prompts.select,
            vcs,
            branch,
            bugzClient: createClient
        }))
        .command<MiddlewareHandlerArguments>(commit.cmd, commit.description, commit.builder, commit.makeHandler({
            confirm: prompts.confirm,
            input: prompts.input,
            vcs,
            branch,
            bugzClient: createClient
        }))
        .command<MiddlewareHandlerArguments>(merge.cmd, merge.description, merge.builder, merge.makeHandler({
            prompts,
            vcs,
            branch,
            bugzClient: createClient,
            cleanup: cleanupBranch.cleanup
        }))
        .command(config.cmd, config.description, config.builder, config.makeHandler(store, questions))   
        .middleware(middleware)     
        .showHelpOnFail(true)
        .demandCommand(1)
        .strict()
        .argv;       
})();

