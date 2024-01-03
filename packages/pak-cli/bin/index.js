#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import pkg from '../helpers/pkg.js';
import * as add from '../commands/add.js';
import * as checkout from '../commands/checkout.js';
import * as cleanup from '../commands/cleanup.js';
import * as commit from '../commands/commit.js';
import * as status from '../commands/status.js';

process.on('uncaughtException', (error) => {
    console.log('Caught exception: ' + error);
    process.exit(1);
});

yargs(hideBin(process.argv))
    .scriptName(pkg.binName)
    .showHelpOnFail(false)
    .command(add.cmd, add.description, add.builder, add.handler)
    .command(checkout.cmd, checkout.description, checkout.builder, checkout.handler)
    .command(cleanup.cmd, cleanup.description, cleanup.builder, cleanup.handler)
    .command(commit.cmd, commit.description, commit.builder, commit.handler)
    .command(status.cmd, status.description, status.builder, status.handler)
    .demandCommand(1)
    .argv;