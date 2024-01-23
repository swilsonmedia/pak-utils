#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import pkg from './utils/pkg.js';
import * as switchCommand from './commands/switch.js';
import createStore from './utils/configurationstore.js';
import * as configCommand from './commands/config.js';
import appRootPath from 'app-root-path';
import * as prompts from './utils/prompts.js';

(async () => {
    const pkgJSON = pkg();
    const store = await createStore<StoreConfig>(appRootPath.resolve('.pak'));

    yargs(hideBin(process.argv))
        .scriptName(Object.keys(pkgJSON.bin)[0])
        .showHelpOnFail(true)
        .command(switchCommand.cmd, switchCommand.description, switchCommand.builder, switchCommand.handler)
        .command(configCommand.cmd, configCommand.description, configCommand.builder, configCommand.makeHandler(store, prompts))
        .showHelpOnFail(true)
        .demandCommand(1)
        .strict()
        .argv;       
})();

