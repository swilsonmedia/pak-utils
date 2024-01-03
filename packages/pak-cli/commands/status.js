import { status } from 'pak-vsc';
import pkg from '../helpers/pkg.js';

export const cmd = 'status';

export const description = 'Current version control status of directory';

export function builder(yargs) {
    return yargs
        .usage(`${pkg.binName} ${cmd}`)
}

export async function handler(args) {
    try {
        console.log(await status());
    } catch (error) {
        console.log(error.stderr);
        process.exit(1);
    }
}