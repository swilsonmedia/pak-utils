import { Argv, Arguments} from 'yargs';
import * as vcs from '../../../pak-vcs/dist/index.js';
import * as branch from '../utils/branch.js';
import createClient from 'pak-bugz';

interface Handler {
    store: StoreConfig, 
    questions: QuestionsFunc,
    prompts: prompts.All,
    vcs: typeof vcs,
    branch: typeof branch,
    createClient: typeof createClient
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
        store, 
        questions, 
        prompts,
        vcs,
        branch,
        createClient
    }: Handler
){
    return async ({ verbose }: Arguments) => {
        if (!await vcs.isRepo()) {
            console.error('Not a git repository (or any of the parent directories)');
            process.exit(1);
        }

        const log = logger(!!verbose);

        const config = {
            username: store.get('username'),
            branch: store.get('branch'),
            token: store.get('token'),
            origin: store.get('origin')
        };
        
        const objectKeys = <Obj extends object>(obj: Obj): (keyof Obj)[] => {
            return Object.keys(obj) as (keyof Obj)[];
        }
        
        const configKeys = objectKeys(config);

        for(const key of configKeys){
            if(!config[key] && key in questions){
                const value = await questions[key]();
                config[key] = value;
                await store.set(key, value);
            }
        }

        const author = await vcs.getAuthorEmail();
        
        const branches = await branch.getBranches(config.username, config.branch, await vcs.listBranches(true)); 
        const existingCaseIds = branches
                            .filter(b => branch.isBugBranchName(b))
                            .map(b => branch.getBugIdFromBranchName(b));

        const client = createClient({
            token: config.token,
            origin: config.origin
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

        const branchName = branch.buildBranchName(config.username, bugId);

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

        log(await vcs.switchToBranch(config.branch));
        log(await vcs.pull())
        log(await vcs.switchToBranch(branchName));
        log(await vcs.merge(config.branch, buildCommitMessage(bugId, 'merging master to branch'), false));
        log(await vcs.switchToBranch(config.branch));
        log(await vcs.merge(branchName, '', true));
        log(await vcs.commit(buildCommitMessage(bugId, commitMessage)));
        log(await vcs.push());

        await cleanup({
            branch: branchName,
            verbose
        });
      

        console.log(`Changes from "${branchName}" were merged to "${config.branch}"`);
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
}


