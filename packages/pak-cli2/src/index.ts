#!/usr/bin/env node
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import pkg from './utils/pkg.js';
import getQuestions from './utils/configquestions.js';
import createStore from './utils/configurationstore.js';
import * as switchCommand from './commands/switch.js';
import * as config from './commands/config.js';
import * as checkout from './commands/checkout.js';
import * as commit from './commands/commit.js';
import * as cleanup from './commands/cleanup.js';
import * as merge from './commands/merge.js';
import * as prompts from './utils/prompts.js';
import * as vcs from '../../pak-vcs/dist/index.js';
import * as branch from './utils/branch.js';
import createClient from 'pak-bugz';

(async () => {
    const pkgJSON = pkg();
    const store = await createStore<StoreConfigProps>(path.join(import.meta.dirname, '../.pak'));
    const questions = getQuestions(prompts);
    
    yargs(hideBin(process.argv))
        .scriptName(Object.keys(pkgJSON.bin)[0])
        .showHelpOnFail(true)
        .command(switchCommand.cmd, switchCommand.description, switchCommand.builder, switchCommand.makeHandler({
            store, 
            questions, 
            select: prompts.select,
            vcs,
            branch,
            createClient
        }))
        .command(cleanup.cmd, cleanup.description, cleanup.builder, cleanup.makeHandler({
            store, 
            questions, 
            select: prompts.select,
            vcs,
            branch,
            createClient
        }))
        .command(checkout.cmd, checkout.description, checkout.builder, checkout.makeHandler({
            store, 
            questions, 
            select: prompts.select,
            vcs,
            branch,
            createClient
        }))
        .command(commit.cmd, commit.description, commit.builder, commit.makeHandler({
            store, 
            questions, 
            confirm: prompts.confirm,
            input: prompts.input,
            vcs,
            branch,
            createClient
        }))
        .command(merge.cmd, merge.description, merge.builder, merge.makeHandler({
            store, 
            questions, 
            prompts,
            vcs,
            branch,
            createClient
        }))
        .command(config.cmd, config.description, config.builder, config.makeHandler(store, questions))
        .showHelpOnFail(true)
        .demandCommand(1)
        .strict()
        .argv;       
})();

