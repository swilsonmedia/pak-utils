import { isRepo, switchToBranch } from 'pak-vsc';
import pkg from './helpers/pkg.js';
import { getBugList } from './helpers/bug.js';
import dotenv from 'dotenv';
import appRootPath from 'app-root-path';
import inquirer from 'inquirer';
import { log, logSuccess } from './helpers/log.js';
import { getBranchList, getBugIdFromBranchName, isBugBranchName } from './helpers/branch.js';
import user from './helpers/user.js';

dotenv.config({ path: appRootPath.resolve('.env') });

export const cmd = 'switch';

export const description = 'Switch between branches';

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
        });
}

export async function handler({ verbose }) {
    if (!await isRepo()) {
        logError('Not a git repository (or any of the parent directories)');
        process.exit(1);
    }

    const branches = await getBranchList(true);
    const branchMap = await getBranchChoiceMap(branches);

    const choices = [...branchMap.keys()];

    const answer = await inquirer.prompt([{
        name: 'branch',
        message: 'Select the branch that you want to switch to',
        type: 'list',
        choices
    }]);

    const branch = branchMap.get(answer.branch);
    const switchResponse = await switchToBranch(branch);

    if (verbose) {
        log(switchResponse);
    }

    logSuccess(`Switched to ${branch}`);
}

async function getBranchChoiceMap(branches) {
    const uniqueBranches = [...new Set(branches)];
    const bugToTitleMap = new Map((await getBugList()).map(bug => [bug.ixBug, bug.sTitle]));
    return new Map(uniqueBranches.map(b => {
        let key = b;

        if (isBugBranchName(b)) {
            const id = getBugIdFromBranchName(b);

            if (bugToTitleMap.has(id)) {
                key = `${key} - ${bugToTitleMap.get(id)}`;
            }
        }

        return [key, b];
    }));
}


