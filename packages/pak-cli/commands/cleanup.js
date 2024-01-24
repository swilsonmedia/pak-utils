import { switchToBranch, deleteLocalBranch, deleteRemoteBranch, isRepo } from '../../pak-vcs/dist/index.js';
import dotenv from 'dotenv';
import pkg from './helpers/pkg.js';
import { handleStandardError } from './helpers/errors.js';
import user from './helpers/user.js';
import { logError, logSuccess, makeLogger } from './helpers/log.js';
import { buildBranchName, getBranchList } from './helpers/branch.js';
import { getBugList, getUniqueBugIdsFromBranchList } from './helpers/bug.js';
import { select } from './helpers/prompts.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

export const cmd = 'cleanup';

export const description = 'Removes local and remote branches';

export function builder(yargs) {
    return yargs
        .usage(`${pkg().binName} ${cmd}`)
        .usage(`${pkg().binName} ${cmd} -b branch/name`)
        .options({
            'b': {
                alias: 'branch',
                type: 'string',
                description: 'Branch Name'
            },
            'v': {
                alias: 'verbose',
                type: 'boolean',
                description: 'Display more logging',
                default: false
            }
        })
}

export async function handler(args) {
    await cleanup(args);
}

export async function cleanup({ branch, verbose }) {
    try {
        if (!await isRepo()) {
            logError('Not a git repository (or any of the parent directories)');
            process.exit(1);
        }

        const log = makeLogger(verbose);
        let branchName = branch;

        if (!branchName) {
            const branches = await getBranchList(true);
            const choices = await getBugList({ filter: getUniqueBugIdsFromBranchList(branches) });

            if (!choices.length) {
                logError('No cases were found to cleanup');
                process.exit(1);
            }

            const question = await select({
                message: 'Select a case that would you like to create a branch for?',
                choices: choices.map(c => `${c.ixBug}: ${c.sTitle}`)
            });

            const id = /^(\d+):/gi.exec(question)[1];
            const username = await user();

            branchName = buildBranchName(username, id);
        }

        log(await switchToBranch(process.env.DEFAULT_BRANCH));
        log(await deleteLocalBranch(branchName));
        log(await deleteRemoteBranch(branchName));
        logSuccess(`"${branchName}" was removed from local and remote`);
    } catch (error) {
        handleStandardError(error);
    }
}
