import { add } from 'pak-vsc';
import pkg from '../helpers/pkg.js';

export const cmd = 'add';

export const description = 'Add changes to staging';

export function builder(yargs) {
    return yargs
        .usage(`${pkg.binName} ${cmd} /path/to/file.ext`)
        .demandCommand(1);
}

export async function handler({ _: args }) {
    add(args.slice(1).join(' '));
}