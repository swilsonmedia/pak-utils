import { isRepo, status } from 'pak-vsc';
import pkg from '../helpers/pkg.js';
import { log, logError } from '../helpers/log.js';


export const cmd = 'status';

export const description = 'Current version control status of directory';

export function builder(yargs) {
    return yargs
        .usage(`${pkg.binName} ${cmd}`)
}

export async function handler(args) {
    try {
        if (!await isRepo()) {
            logError('Not a git repository (or any of the parent directories)');
            process.exit(1);
        }

        log(await status())
    } catch (error) {
        logError(error.stderr);
        process.exit(1);
    }
}