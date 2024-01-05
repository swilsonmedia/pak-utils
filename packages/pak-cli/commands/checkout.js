import { checkout, pull, switchToBranch, setUpstream, isRepo } from 'pak-vsc';
import pkg from '../helpers/pkg.js';
import { handleStandardError } from '../helpers/errors.js';
import { log, logError, logSuccess } from '../helpers/log.js';
import { promptForBugSelection } from '../helpers/bug.js';
import getBranchById from '../helpers/branch.js';

export const cmd = 'checkout';

export const description = 'Creates a new branch by case #';

export function builder(yargs) {
    return yargs
        .usage(`${pkg.binName} ${cmd}`)
        .options({
            'v': {
                alias: 'verbose',
                type: 'boolean',
                description: 'Display more logging',
                default: false
            }
        })
}

export async function handler({ verbose }) {
    try {
        if (!await isRepo()) {
            logError('Not a git repository (or any of the parent directories)');
            process.exit(1);
        }

        const { ixBug: id } = await promptForBugSelection();

        if (!id) {
            logError('Prompt did not return an id');
            process.exit(1);
        }


        const branchName = await getBranchById(id);

        const switchResponse = await switchToBranch(process.env.DEFAULT_BRANCH);
        const pullResponse = await pull();
        const checkoutResponse = await checkout(branchName);
        const upstreamResponse = await setUpstream(branchName);

        if (verbose) {
            log(switchResponse);
        }

        logSuccess(checkoutResponse);

        if (verbose) {
            log(pullResponse);
            log(upstreamResponse);
        }
    } catch (error) {
        handleStandardError(error);
    }
}

