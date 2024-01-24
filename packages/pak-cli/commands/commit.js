import { getCurrentBranch, status, add, commit, push, isRepo } from 'pak-vcs';
import dotenv from 'dotenv';
import pkg from './helpers/pkg.js';
import { handleStandardError } from './helpers/errors.js';
import { logError, logSuccess, makeLogger } from './helpers/log.js';
import { addBugToMessage } from './helpers/bug.js';
import { getBugIdFromBranchName, isBugBranchName } from './helpers/branch.js';
import { confirm, prompt } from './helpers/prompts.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

export const cmd = 'commit';

export const description = 'Commit change to local and remote';

export function builder(yargs) {
    return yargs
        .usage(`${pkg().binName} ${cmd}`)
        .usage(`${pkg().binName} ${cmd} -m "Message here"`)
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

            const answer = await confirm({ message: 'Do you want to include unstaged changes in this commit?' });

            if (!answer && !/Changes\sto\sbe\scommitted/gi.test(currentStatus)) {
                logError('No staged changes to commit');
                process.exit(1);
            }

            if (answer) {
                log(await add());
            }
        }

        if (!commitMessage) {
            const answer = await prompt({
                message: 'Please enter a commit message',
            });

            commitMessage = answer;
        }

        if (isBugBranchName(currentBranch)) {
            commitMessage = addBugToMessage(getBugIdFromBranchName(currentBranch), commitMessage);
        }

        log(await commit(commitMessage));
        log(await push());

        logSuccess('Committed changes to local and remote branch!');
    } catch (error) {
        handleStandardError(error);
    }
}

