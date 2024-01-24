import { cherryPick, commit, getAuthorEmail, isRepo, logForAuthorEmail, merge, pull, push, switchToBranch } from '../../pak-vcs/dist/index.js';
import { handleStandardError } from './helpers/errors.js';
import { logError, logSuccess, makeLogger } from './helpers/log.js';
import pkg from './helpers/pkg.js';
import { addBugToMessage, findBugCases, getUniqueBugIdsFromBranchList, promptForBugSelection } from './helpers/bug.js';
import { buildBranchName, getBranchList } from './helpers/branch.js';
import { cleanup } from './cleanup.js';
import user from './helpers/user.js';
import { confirm, prompt, select } from './helpers/prompts.js';

export const cmd = 'merge';

export const description = 'Merge a case by passing a case number and commit message';

export function builder(yargs) {
    return yargs
        .usage(`${pkg().binName} ${cmd}`)
        .usage(`${pkg().binName} ${cmd} -m "Message"`)
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

        const author = await getAuthorEmail();

        let commitMessage = message;
        const log = makeLogger(verbose);
        const username = await user();
        const branchName = await buildBranchName(username, bugId);

        if (!commitMessage) {
            await switchToBranch(branchName);
            const logResults = await logForAuthorEmail(author);
            const topBugLogs = findBugCases(logResults, bugId);

            if (!topBugLogs.length) {
                logError(`There were no commits found for bug id ${bugId}`);
                process.exit(1);
            }

            const NEW_MESSAGE = 'Enter a new message';

            const answer = await select({
                message: 'Please select a previous comment or enter a new one.',
                choices: [NEW_MESSAGE].concat(topBugLogs.map(log => log.message))
            });

            commitMessage = answer;

            if (commitMessage === NEW_MESSAGE) {
                const answer = await prompt({
                    message: 'Please enter a commit message',
                });

                commitMessage = answer;
            }
        }

        log(await switchToBranch(process.env.DEFAULT_BRANCH));
        log(await pull())
        log(await switchToBranch(branchName));
        log(await merge(process.env.DEFAULT_BRANCH, addBugToMessage(bugId, 'merging master to branch'), false));
        log(await switchToBranch(process.env.DEFAULT_BRANCH));
        log(await merge(branchName, '', true));
        log(await commit(addBugToMessage(bugId, commitMessage)));
        log(await push());

        logSuccess(`Changes from "${branchName}" were merged to "${process.env.DEFAULT_BRANCH}"`);

        if (!keep) {
            await cleanup({
                branch: branchName,
                verbose
            });
        }

        const mergeAnswer = await confirm({
            message: 'Merge to release tag?',
            default: false
        });

        if (mergeAnswer) {
            const branches = await getBranchList();
            const releaseAnswer = await select({
                message: 'Select the release branch?',
                choices: branches.filter(b => b.includes('releasetags'))
            });
            
            const mainCommits = await logForAuthorEmail(author);
            log(await switchToBranch(releaseAnswer));
            const releaseCommits = await logForAuthorEmail(author);           

            const commitAnswer = await select({
                message: 'Select the commit you would like to release?',
                choices: findUnmergedBugCommits(mainCommits, releaseCommits, bugId)
            });

            const commitHash = commitAnswer.split(' ')[0];
            
            log(await cherryPick(commitHash));  
            log(await push());
            log(await switchToBranch(process.env.DEFAULT_BRANCH));     
            logSuccess(`Merged ${commitHash} to ${releaseAnswer} for release`);
        }

        log(await switchToBranch(process.env.DEFAULT_BRANCH));        
    } catch (error) {
        handleStandardError(error);
        process.exit(1);
    }
}

function findUnmergedBugCommits(from, to, id){
    const idSplit = ` BugzId: ${id} -`;
    const commits = from.split('\n').filter(commit => commit.includes(idSplit)).map(commit => {
        const parts = commit.split(idSplit);

        return{
            original: commit,
            hash: parts[0],
            message: parts[1]
        };
    });
    const toValues = to.split('\n').filter(commit => commit.includes(idSplit)).map(commit => commit.split(idSplit)[1]);

    return commits.filter(commit => !toValues.includes(commit.message)).map(commit => commit.original);
}