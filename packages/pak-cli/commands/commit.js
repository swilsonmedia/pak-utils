import { getCurrentBranch, status, add, commit, push, isRepo } from 'pak-vsc';
import dotenv from 'dotenv';
import inquirer from 'inquirer';
import appRootPath from 'app-root-path';
import pkg from './helpers/pkg.js';
import { handleStandardError } from './helpers/errors.js';
import { logError, logSuccess, makeLogger } from './helpers/log.js';
import { addBugToMessage } from './helpers/bug.js';
import { getBugIdFromBranchName, isBugBranchName } from './helpers/branch.js';

dotenv.config({ path: appRootPath.resolve('.env') });

export const cmd = 'commit';

export const description = 'Commit change to local and remote';

export function builder(yargs) {
    return yargs
        .usage(`${pkg.binName} ${cmd}`)
        .usage(`${pkg.binName} ${cmd} -m "Message here"`)
        .option({
            'm': {
                alias: 'message',
                type: 'string',
                description: 'Commit Message'
            },
            'v': {
                alias: 'verbose',
                type: 'boolean',
                description: 'Display more logging',
                default: false
            }
        });
}

export async function handler({ message, verbose }) {
    try {
        if (!await isRepo()) {
            logError('Not a git repository (or any of the parent directories)');
            process.exit(1);
        }

        const log = makeLogger(verbose);
        const currentStatus = await status();
        const currentBranch = await getCurrentBranch();

        let commitMessage = message;

        if (/nothing\sto\scommit/gi.test(currentStatus)) {
            logError('No changes to commit');
            process.exit(1);
        }

        if (/untracked|Changes\snot\sstaged\sfor\scommit/gi.test(currentStatus)) {
            log('You have untracked or unstaged changes')

            const confirm = await inquirer.prompt([{
                name: 'track',
                message: 'Do you want to include unstaged changes in this commit?',
                type: 'confirm'
            }]);

            if (!confirm.track && !/Changes\sto\sbe\scommitted/gi.test(currentStatus)) {
                logError('No staged changes to commit');
                process.exit(1);
            }

            if (confirm.track) {
                log(await add());
            }
        }

        if (!commitMessage) {
            const answer = await inquirer.prompt([{
                name: 'message',
                message: 'Please enter a commit message',
                type: 'input'
            }]);

            commitMessage = answer.message;
        }

        if (isBugBranchName(currentBranch)) {
            commitMessage = addBugToMessage(getBugIdFromBranchName(currentBranch), commitMessage);
        }

        log(await commit(commitMessage));
        log(await push());

        logSuccess('Commit made to local and remote branch complete!');
    } catch (error) {
        handleStandardError(error);
    }
}

