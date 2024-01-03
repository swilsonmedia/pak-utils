import { getCurrentBranch, status, add, commit, push } from 'pak-vsc';
import dotenv from 'dotenv';
import createClient from 'pak-bugz';
import inquirer from 'inquirer';
import appRootPath from 'app-root-path';
import pkg from '../helpers/pkg.js';
import { handleStandardError } from '../helpers/errors.js';
import user from '../helpers/user.js';

dotenv.config({ path: appRootPath.resolve('.env') });

export const cmd = 'commit';

export const description = 'Commit change to local and remote';

export function builder(yargs) {
    return yargs
        .usage(`${pkg.binName} ${cmd}`)
        .usage(`${pkg.binName} ${cmd} -m "Message here"`)
        .option('m', {
            alias: 'message',
            type: 'string',
            description: 'Commit Message'
        });
}

export async function handler({ message }) {
    try {
        const currentStatus = await status();
        const currentBranch = await getCurrentBranch();
        const bugzId = /fb\-(\d+)/gi.exec(currentBranch)[1];
        let commitMessage = message;

        if (/nothing\sto\scommit/gi.test(currentStatus)) {
            console.log('No changes to commit');
            process.exit(1);
        }

        if (/untracked|Changes\snot\sstaged\sfor\scommit/gi.test(currentStatus)) {
            console.log('You have untracked or unstaged changes\n\n')

            const confirm = await inquirer.prompt([{
                name: 'track',
                message: 'Do you want to include all changes in this commit?',
                type: 'confirm'
            }]);

            if (!confirm.track && !/Changes\sto\sbe\scommitted/gi.test(currentStatus)) {
                console.log('No staged changes to commit');
                process.exit(1);
            }

            if (confirm.track) {
                await add();
            }

            if (!commitMessage) {
                console.log('');
                const answer = await inquirer.prompt([{
                    name: 'message',
                    message: 'Please enter a commit message',
                    type: 'input'
                }]);

                commitMessage = answer.message;
            }
        }

        await commit(commitMessage);
        await push();

        console.log('');
        console.log('Commit made to local and remote branch complete!');
        console.log('');
    } catch (error) {
        handleStandardError(error);
    }
}

