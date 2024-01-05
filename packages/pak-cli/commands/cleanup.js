import { switchToBranch, deleteLocalBranch, deleteRemoteBranch, isRepo } from 'pak-vsc';
import dotenv from 'dotenv';
import createClient from 'pak-bugz';
import inquirer from 'inquirer';
import appRootPath from 'app-root-path';
import pkg from '../helpers/pkg.js';
import { handleStandardError } from '../helpers/errors.js';
import user from '../helpers/user.js';
import { log, logError, logSuccess } from '../helpers/log.js';

dotenv.config({ path: appRootPath.resolve('.env') });

export const cmd = 'cleanup';

export const description = 'Removes local and remote branches';

export function builder(yargs) {
    return yargs
        .usage(`${pkg.binName} ${cmd}`)
        .usage(`${pkg.binName} ${cmd} -b branch/name`)
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

        let branchName = branch;

        if (!branchName) {
            const client = await createClient({
                token: process.env.BUGZ_TOKEN,
                origin: process.env.BUGZ_ORIGIN,
            });

            const cases = await client.cases.list('inbox', { cols: 'sTitle' });

            if (cases.count === 0) {
                logError('No cases were found to cleanup');
                process.exit(1);
            }

            const answer = await inquirer.prompt([{
                name: 'case',
                message: 'Select a case that would you like to create a branch for?',
                type: 'list',
                choices: cases.cases.map(c => `${c.ixBug}: ${c.sTitle}`)
            }]);

            const id = /^(\d+):/gi.exec(answer.case)[1];
            const username = await user();

            branchName = `users/${username}/fb-${id}`;
        }

        await switchToBranch(process.env.DEFAULT_BRANCH);
        const localResponse = await deleteLocalBranch(branchName);
        const remoteResponse = await deleteRemoteBranch(branchName);

        if (verbose) {
            log(localResponse);
            log(remoteResponse);
        }

        logSuccess(`"${branchName}" was removed from local and remote`);

    } catch (error) {
        handleStandardError(error);
    }
}
