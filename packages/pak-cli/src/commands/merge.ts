import { Argv, Arguments} from 'yargs';
import * as vcs from '../../../pak-vcs/dist/index.js';
import * as branch from '../utils/branch.js';
import createClient from 'pak-bugz';

interface Handler {
    userSettings: StoreConfigProps,
    prompts: prompts.All,
    vcs: typeof vcs,
    branch: typeof branch,
    createClient: typeof createClient,
    cleanup: (branchName: string, branches: string[], verbose: boolean) => void
}

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

export function makeHandler({
        userSettings,
        prompts,
        vcs,
        branch,
        createClient,
        cleanup
    }: Handler
){
    return async ({ verbose }: Arguments) => {
        if (!await vcs.isRepo()) {
            console.error('Not a git repository (or any of the parent directories)');
            process.exit(1);
        }

        const log = logger(!!verbose);       

        const author = await vcs.getAuthorEmail();
        
        const branches = await branch.getBranches(userSettings.username, userSettings.branch, await vcs.listBranches(true)); 
        const existingCaseIds = branches
                            .filter(b => branch.isBugBranchName(b))
                            .map(b => branch.getBugIdFromBranchName(b));

        const client = createClient({
            token: userSettings.token,
            origin: userSettings.origin
        });

        const casesList = await client.listCases({cols: ['sTitle']});
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

        const branchName = branch.buildBranchName(userSettings.username, bugId);

        const logResults = await vcs.logForAuthorEmail(author);
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

        log(await vcs.switchToBranch(userSettings.branch));
        log(await vcs.pull())
        log(await vcs.switchToBranch(branchName));
        log(await vcs.merge(userSettings.branch, buildCommitMessage(bugId, 'merging master to branch'), false));
        log(await vcs.switchToBranch(userSettings.branch));
        log(await vcs.merge(branchName, '', true));
        log(await vcs.commit(buildCommitMessage(bugId, commitMessage)));
        log(await vcs.push());

        console.log(`Changes from "${branchName}" were merged to "${userSettings.branch}"`);
        console.log('');

        await cleanup(branchName, branches, !!verbose);

        const mergeAnswer = await prompts.confirm({
            message: 'Merge to release tag?',
            default: false
        });

        if (mergeAnswer) {
            const releaseAnswer = await prompts.select({
                message: 'Select the release branch?',
                choices: branches.filter(b => b.includes('releasetags'))
            });
            
            const mainCommits = await vcs.logForAuthorEmail(author);
            
            log(await vcs.switchToBranch(releaseAnswer));
            
            const releaseCommits = await vcs.logForAuthorEmail(author);           

            const commitAnswer = await prompts.select({
                message: 'Select the commit you would like to release?',
                choices: findUnmergedBugCommits(mainCommits, releaseCommits, bugId)
            });

            const commitHash = commitAnswer.split(' ')[0];
            
            log(await vcs.cherryPick(commitHash));  
            log(await vcs.push());
            log(await vcs.switchToBranch(userSettings.branch));     
            
            console.log('');
            console.log(`Merged ${commitHash} to ${releaseAnswer} for release`);
            console.log('');
        }

        log(await vcs.switchToBranch(userSettings.branch));  
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


