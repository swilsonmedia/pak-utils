import { Argv } from 'yargs';
import { MakeCleanup, MiddlewareHandlerArguments } from '../types.js';

export const cmd = 'merge';

export const description = 'Merge a case by passing a case number and commit message';

export function builder(yargs: Argv) {
    yargs
        .usage(`pak ${cmd}`)
        .options({
            'v': {
                alias: 'verbose',
                type: 'boolean',
                description: 'Display more logging',
                default: false
            }
        })
}

export function makeHandler(makeCleanup: MakeCleanup){
    return async ({ verbose, _pak: { branch, versionControl, prompts, bugz } }: MiddlewareHandlerArguments) => {
        const log = logger(!!verbose);       

        
        const branches = await branch.getLocalUserBranches(); 
        const existingCaseIds = branch.getIdsFromBranches(branches);

        const casesList = await bugz.listCases({cols: ['sTitle']});
        const existingCasesList = casesList.filter((c: any) => existingCaseIds.includes(c.ixBug.toString()));
        
        if (!existingCasesList.length) {   
            console.error('No cases were found');
            process.exit(1);
        }

        const bugId = await prompts.select({
            message: 'Select a case that would you like to create a branch for?',
            choices: existingCasesList.map((c: any) => ({
                name: `${c.ixBug}: ${c.sTitle}`,
                value: c.ixBug
            }))
        });

        const defaultBranch = await branch.defaultBranchName();

        if(!defaultBranch){
            console.error('Could not discover default branch');
            process.exit(1);
        }

        const branchName = branch.buildBranchName(+bugId);
        const logResults = await versionControl.log();
        const topBugLogs = findBugCases(logResults, bugId);

        if (!topBugLogs.length) {
            console.log(`There were no commits found for bug id ${bugId}`);
            process.exit(1);
        }

        const NEW_MESSAGE = 'Enter a new message';

        const answer = await prompts.select({
            message: 'Please select a previous comment or enter a new one.',
            choices: [NEW_MESSAGE].concat(topBugLogs.map(log => log.message))
        });

        let commitMessage = answer;

        if (commitMessage === NEW_MESSAGE) {
            const answer = await prompts.input({
                message: 'Please enter a commit message',
            });

            commitMessage = answer;
        }

        log(await versionControl.switchToDefault());
        log(await versionControl.pull())
        log(await versionControl.switchTo(branchName));
        log(await versionControl.merge(defaultBranch, buildCommitMessage(bugId, 'merging master to branch'), false));
        log(await versionControl.switchToDefault());
        log(await versionControl.merge(branchName, '', true));
        log(await versionControl.commit(buildCommitMessage(bugId, commitMessage)));
        log(await versionControl.push());

        console.log(`Changes from "${branchName}" were merged to "${defaultBranch}"`);
        console.log('');

        const cleanup = makeCleanup(versionControl);

        await cleanup({
            branches,
            branchName,
            verbose: !!verbose
        });

        const mergeAnswer = await prompts.confirm({
            message: 'Merge to release tag?',
            default: false
        });

        if (mergeAnswer) {
            const releaseBranches = await branch.getReleaseBranches();

            const releaseAnswer = await prompts.select({
                message: 'Select the release branch?',
                choices: releaseBranches
            });
            
            const mainCommits = await versionControl.log();
            
            log(await versionControl.switchTo(releaseAnswer));
            
            const releaseCommits = await versionControl.log();           

            const commitAnswer = await prompts.select({
                message: 'Select the commit you would like to release?',
                choices: findUnmergedBugCommits(mainCommits, releaseCommits, bugId)
            });

            const commitHash = commitAnswer.split(' ')[0];
            
            log(await versionControl.cherryPick(commitHash));  
            log(await versionControl.push());
            log(await versionControl.switchTo(defaultBranch));     
            
            console.log('');
            console.log(`Merged ${commitHash} to ${releaseAnswer} for release`);
            console.log('');
        }

        log(await versionControl.switchTo(defaultBranch));  
    }

    function logger(verbose: boolean){
        return (input: string): void => {
            if(!verbose){
                return;
            }

            console.log(input);
        }
    }

    function buildCommitMessage(caseId: string | number, commitMessage: string){
        return `BugzId: ${caseId} - ${commitMessage}`;
    }

    function findBugCases(versionControlLog: string, bugId: string | number) {
        const reg = new RegExp(`\\sbugzid:\\s${bugId}\\s\\-\\s`, 'gi');

        return versionControlLog.split('\n')
            .filter(log => reg.test(log))
            .map(log => {
                const parts = log.split(reg);
                return {
                    message: parts[1],
                    bugId,
                    hash: parts[0],
                    log
                }
            });
    }

    function findUnmergedBugCommits(from: string, to: string, id: string){
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
}


