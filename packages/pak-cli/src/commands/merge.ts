import { Argv } from 'yargs';
import { MiddlewareHandlerArguments } from '../types.js';

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

export async function handler({ verbose, _pak: { branch, prompts, bugz } }: MiddlewareHandlerArguments){
    const log = logger(!!verbose);               
    const existingCaseIds = await branch.getExistingBugIds();
    const casesList = await bugz.listCases({cols: ['sTitle']});
    const existingCasesList = casesList.filter((c: any) => existingCaseIds.includes(c.ixBug));
    
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

    await branch.switchTo(+bugId);
    
    const checkins = await branch.logCaseCheckins(+bugId);

    if (!checkins.length) {
        console.log(`There were no commits found for bug id ${bugId}`);
        process.exit(1);
    }

    const NEW_MESSAGE = 'Enter a new message';

    const selectedMessage = await prompts.select({
        message: 'Please select a previous comment or enter a new one.',
        choices: [NEW_MESSAGE].concat(checkins.map(log => log.message))
    });

    let commitMessage = selectedMessage;

    if (commitMessage === NEW_MESSAGE) {
        const selectedMessage = await prompts.input({
            message: 'Please enter a commit message',
        });

        commitMessage = selectedMessage;
    }

    log(await branch.merge(+bugId, commitMessage));

    console.log(`Merge complete!`);

    log(await branch.delete(+bugId));

    console.log(`Branch deleted`);

    const mergeAnswer = await prompts.confirm({
        message: 'Merge to release tag?',
        default: false
    });

    if (mergeAnswer) {
        const releaseBranches = await branch.listReleases();

        const selectedRelease = await prompts.select({
            message: 'Select the release branch?',
            choices: releaseBranches
        });
        
        const choices = (await branch.findUnmergedReleaseCommits(+bugId, selectedRelease))
                            .map(commit => ({
                                name: commit.log,
                                value: commit.hash
                            }));
               
        const commitHash = await prompts.select({
            message: 'Select the commit you would like to release?',
            choices
        });        
        
        log(await branch.pushCommitToRelease(commitHash, selectedRelease));

        console.log(`Merged ${commitHash} for release on ${selectedRelease}!`);
    }
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


