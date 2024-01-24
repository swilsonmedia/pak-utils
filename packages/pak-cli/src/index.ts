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
import makeCleanUpCommand from './commands/cleanup.js';
import * as merge from './commands/merge.js';
import * as prompts from './utils/prompts.js';
import * as vcs from '../../pak-vcs/dist/index.js';
import * as branch from './utils/branch.js';
import createClient from 'pak-bugz';
import checkForConfigOptions from './utils/checkforconfigoptions.js';

(async () => {
    const pkgJSON = pkg();
    const store = await createStore<StoreConfigProps>(path.join(import.meta.dirname, '../.pak'));
    const questions = getQuestions(prompts);
    const userSettings = await checkForConfigOptions(store, questions);

    const cleanupBranch = makeCleanUpCommand({
        userSettings, 
        select: prompts.select,
        vcs,
        branch,
        createClient
    });

    yargs(hideBin(process.argv))
        .scriptName(Object.keys(pkgJSON.bin)[0])
        .showHelpOnFail(true)
        .command(switchCommand.cmd, switchCommand.description, switchCommand.builder, switchCommand.makeHandler({
            userSettings, 
            select: prompts.select,
            vcs,
            branch,
            createClient
        }))
        .command(cleanupBranch.cmd, cleanupBranch.description, cleanupBranch.builder, cleanupBranch.handler)
        .command(checkout.cmd, checkout.description, checkout.builder, checkout.makeHandler({
            userSettings, 
            select: prompts.select,
            vcs,
            branch,
            createClient
        }))
        .command(commit.cmd, commit.description, commit.builder, commit.makeHandler({
            confirm: prompts.confirm,
            input: prompts.input,
            vcs,
            branch,
            createClient
        }))
        .command(merge.cmd, merge.description, merge.builder, merge.makeHandler({
            userSettings,
            prompts,
            vcs,
            branch,
            createClient,
            cleanup: cleanupBranch.cleanup
        }))
        .command(config.cmd, config.description, config.builder, config.makeHandler(store, questions))
        .showHelpOnFail(true)
        .demandCommand(1)
        .strict()
        .argv;       
})();

