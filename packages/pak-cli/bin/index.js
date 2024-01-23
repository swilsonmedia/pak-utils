#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import pkg from '../commands/helpers/pkg.js';
import * as checkout from '../commands/checkout.js';
import * as cleanup from '../commands/cleanup.js';
import * as commit from '../commands/commit.js';
import * as switchCommand from '../commands/switch.js';
import * as mergeCommands from '../commands/merge.js';

process.on('uncaughtException', (error) => {
    console.log('Caught exception: ' + error);
    process.exit(1);
});

yargs(hideBin(process.argv))
    .scriptName(pkg().binName)
    .showHelpOnFail(true)
    .command(checkout.cmd, checkout.description, checkout.builder, checkout.handler)
    .command(cleanup.cmd, cleanup.description, cleanup.builder, cleanup.handler)
    .command(commit.cmd, commit.description, commit.builder, commit.handler)
    .command(mergeCommands.cmd, mergeCommands.description, mergeCommands.builder, mergeCommands.handler)
    .command(switchCommand.cmd, switchCommand.description, switchCommand.builder, switchCommand.handler)
    .demandCommand(1)
    .strict()
    .argv;