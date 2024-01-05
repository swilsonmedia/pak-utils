import { commit, getAuthorEmail, isRepo, logForAuthorEmail, merge, pull, push, switchToBranch } from 'pak-vsc';
import { handleStandardError } from './helpers/errors.js';
import { log, logError, logSuccess } from './helpers/log.js';
import pkg from './helpers/pkg.js';
import { addBugToMessage, findBugCases, getUniqueBugIdsFromBranchList, promptForBugSelection } from './helpers/bug.js';
import inquirer from 'inquirer';
import { buildBranchName, getBranchList } from './helpers/branch.js';
import { cleanup } from './cleanup.js';
import user from './helpers/user.js';

export const cmd = 'merge';

export const description = 'Merge a case by passing a case number and commit message';

export function builder(yargs) {
    return yargs
        .usage(`${pkg.binName} ${cmd}`)
        .usage(`${pkg.binName} ${cmd} -m "Message"`)
        .options({
            'm': {
                alias: 'message',
                type: 'string',
                description: 'Commit Message'
            },
            'k': {
                alias: 'keep',
                type: 'boolean',
                description: 'Do not delete local and remote branches after merge',
                default: false
            },
            'v': {
                alias: 'verbose',
                type: 'boolean',
                description: 'Display more logging',
                default: false
            }
        });
}

export async function handler(args) {
    const branches = await getBranchList();
    const chosenBug = await promptForBugSelection({ filter: getUniqueBugIdsFromBranchList(branches) });

    await handleMerge({ ...args, bugId: chosenBug.ixBug });
}

export async function handleMerge({ verbose, keep, message, bugId }) {
    try {
        if (!await isRepo()) {
            logError('Not a git repository (or any of the parent directories)');
            process.exit(1);
        }

        let commitMessage = message;
        const username = await user();
        const branchName = await buildBranchName(username, bugId);

        if (!commitMessage) {
            await switchToBranch(branchName);

            const author = await getAuthorEmail();
            const logResults = await logForAuthorEmail(author);
            const topBugLogs = findBugCases(logResults, bugId);

            if (!topBugLogs.length) {
                logError(`There were no commits found for bug id ${bugId}`);
                process.exit(1);
            }

            const NEW_MESSAGE = 'Enter a new message';

            let question = await inquirer.prompt({
                name: 'message',
                message: 'Please select a previous comment or enter a new one.',
                type: 'list',
                choices: [NEW_MESSAGE].concat(topBugLogs.map(log => log.message))
            });

            commitMessage = question.message;

            if (commitMessage === NEW_MESSAGE) {
                question = await inquirer.prompt({
                    name: 'message',
                    message: 'Please enter a commit message',
                    type: 'input'
                });

                commitMessage = question.message;
            }
        }

        let switchTo = await switchToBranch(process.env.DEFAULT_BRANCH);

        if (verbose) {
            log(switchTo);
        }

        const pullResponse = await pull();

        if (verbose) {
            log(pullResponse);
        }



        switchTo = await switchToBranch(branchName);

        if (verbose) {
            log(switchTo);
        }

        const mergeFromDefault = await merge(process.env.DEFAULT_BRANCH, addBugToMessage(bugId, 'merging master to branch'), false);

        if (verbose) {
            log(mergeFromDefault);
        }

        switchTo = await switchToBranch(process.env.DEFAULT_BRANCH);

        if (verbose) {
            log(switchTo);
        }

        const mergeFromBranch = await merge(branchName, '', true);

        if (verbose) {
            log(mergeFromBranch);
        }

        const commitResponse = await commit(addBugToMessage(bugId, commitMessage));

        if (verbose) {
            log(commitResponse);
        }

        const pushResponse = await push();

        if (verbose) {
            log(pushResponse);
        }

        logSuccess(`Changes from "${branchName}" were merged to "${process.env.DEFAULT_BRANCH}"`);

        if (!keep) {
            await cleanup({
                branch: branchName,
                verbose
            });
        }
    } catch (error) {
        handleStandardError(error);
        process.exit(1);
    }
}