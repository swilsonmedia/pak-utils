import { switchToBranch, deleteLocalBranch, deleteRemoteBranch } from 'pak-vsc';
import dotenv from 'dotenv';
import createClient from 'pak-bugz';
import inquirer from 'inquirer';
import appRootPath from 'app-root-path';
import pkg from '../helpers/pkg.js';
import { handleStandardError } from '../helpers/errors.js';
import user from '../helpers/user.js';

dotenv.config({ path: appRootPath.resolve('.env') });

export const cmd = 'cleanup';

export const description = 'Removes local and remote branches';

export function builder(yargs) {
    return yargs
        .usage(`${pkg.binName} ${cmd}`)
        .usage(`${pkg.binName} ${cmd} -b branch/name`)
        .option('b', {
            alias: 'branch',
            type: 'string',
            description: 'Branch Name'
        })
}

export async function handler({ branch }) {
    await cleanup(branch);
}

export async function cleanup(branch) {
    try {
        let branchName = branch;

        if (!branchName) {
            const client = await createClient({
                token: process.env.BUGZ_TOKEN,
                origin: process.env.BUGZ_ORIGIN,
            });

            const cases = await client.cases.list('inbox', { cols: 'sTitle' });

            if (cases.count === 0) {
                console.log('No cases were found to cleanup');
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

        const switchResponse = await switchToBranch(process.env.DEFAULT_BRANCH);
        const localResponse = await deleteLocalBranch(branchName);
        const remoteResponse = await deleteRemoteBranch(branchName);

        console.log(switchResponse);
        console.log('');
        console.log(localResponse);
        console.log('');
        console.log(remoteResponse);
        console.log('');


    } catch (error) {
        handleStandardError(error);
    }
}
