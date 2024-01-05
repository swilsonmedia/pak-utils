import { checkout, pull, switchToBranch, setUpstream, isRepo } from 'pak-vsc';
import pkg from './helpers/pkg.js';
import { handleStandardError } from './helpers/errors.js';
import { log, logError, logSuccess } from './helpers/log.js';
import { getUniqueBugIdsFromBranchList, promptForBugSelection } from './helpers/bug.js';
import { buildBranchName, getBranchList } from './helpers/branch.js';
import dotenv from 'dotenv';
import appRootPath from 'app-root-path';
import user from './helpers/user.js';

dotenv.config({ path: appRootPath.resolve('.env') });

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
        const branches = await getBranchList(true);  

        if (!await isRepo()) {
            logError('Not a git repository (or any of the parent directories)');
            process.exit(1);
        }

        const { ixBug: id } = await promptForBugSelection({ exclude: getUniqueBugIdsFromBranchList(branches) });

        if (!id) {
            logError('Prompt did not return an id');
            process.exit(1);
        }

        const username = await user();
        const branchName = buildBranchName(username, id);
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

