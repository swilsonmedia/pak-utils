import { checkout, pull, switchToBranch, setUpstream } from 'pak-vsc';
import dotenv from 'dotenv';
import createClient from 'pak-bugz';
import inquirer from 'inquirer';
import appRootPath from 'app-root-path';
import pkg from '../helpers/pkg.js';
import { handleStandardError } from '../helpers/errors.js';
import user from '../helpers/user.js';

dotenv.config({ path: appRootPath.resolve('.env') });

export const cmd = 'checkout';

export const description = 'Creates a new branch by case #';

export function builder(yargs) {
    return yargs.usage(`${pkg.binName} ${cmd}`);
}

export async function handler() {
    try {
        const client = await createClient({
            token: process.env.BUGZ_TOKEN,
            origin: process.env.BUGZ_ORIGIN,
        });

        const cases = await client.cases.list('inbox', { cols: 'sTitle' });

        if (cases.count === 0) {
            console.log('No cases found to checkout a branch for');
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
        const branchName = `users/${username}/fb-${id}`;

        const switchResponse = await switchToBranch(process.env.DEFAULT_BRANCH);
        const pullResponse = await pull();
        const checkoutResponse = await checkout(branchName);
        const upstreamResponse = await setUpstream(branchName);

        console.log(switchResponse);
        console.log('');
        console.log(pullResponse);
        console.log('');
        console.log(checkoutResponse);
        console.log('');
        console.log(upstreamResponse);

    } catch (error) {
        handleStandardError(error);
    }
}

