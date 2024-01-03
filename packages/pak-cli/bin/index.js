#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
    .scriptName('pak')
    .help('h')
    .alias('h', 'help')
    .showHelpOnFail(true)
    .commandDir('../commands')
    .argv;