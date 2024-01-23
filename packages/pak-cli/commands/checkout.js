import { checkout, pull, switchToBranch, setUpstream, isRepo } from 'pak-vsc';
import pkg from './helpers/pkg.js';
import { handleStandardError } from './helpers/errors.js';
import { logError, logSuccess, makeLogger } from './helpers/log.js';
import { getUniqueBugIdsFromBranchList, promptForBugSelection } from './helpers/bug.js';
import { buildBranchName, getBranchList } from './helpers/branch.js';
import dotenv from 'dotenv';
import user from './helpers/user.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

export const cmd = 'checkout';

export const description = 'Creates a new branch by case #';

export function builder(yargs) {
    return yargs
        .usage(`${pkg().binName} ${cmd}`)
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

        const log = makeLogger(verbose);
        const branches = await getBranchList(true);  

        console.log(getUniqueBugIdsFromBranchList(branches));
        console.log(await promptForBugSelection({ exclude: getUniqueBugIdsFromBranchList(branches) }));

        return;


        const { ixBug: id } = await promptForBugSelection({ exclude: getUniqueBugIdsFromBranchList(branches) });
        const username = await user();

        if (!id) {
            logError('Prompt did not return an id');
            process.exit(1);
        }

        const branchName = buildBranchName(username, id);

        log(await switchToBranch(process.env.DEFAULT_BRANCH));        
        log(await pull());
        log(await checkout(branchName));
        log(await setUpstream(branchName));

        logSuccess(`"${branchName}" was checked out`);        
    } catch (error) {
        handleStandardError(error);
    }
}

