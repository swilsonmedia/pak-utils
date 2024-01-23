import { Argv, Arguments} from 'yargs';
import * as vcs from '../../../pak-vcs/dist/index.js';
import * as branch from '../utils/branch.js';
import createClient from 'pak-bugz';

interface Handler {
    store: StoreConfig, 
    questions: QuestionsFunc,
    select: prompts.SelectPrompt,
    vcs: typeof vcs,
    branch: typeof branch,
    createClient: typeof createClient
}

export const cmd = 'cleanup';

export const description = 'Delete old branches from local and remote';

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
        select,
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

        const branches = await branch.getBranches(config.username, config.branch, await vcs.listBranches(true));

 

        const client = createClient({
            token: config.token,
            origin: config.origin
        });

        const casesList = await client.listCases({cols: ['sTitle']});

        if (!casesList.length) {
            console.error('No cases were found');
            process.exit(1);
        }

        const branchesNoDefault = branches.filter(b => b !== config.branch);
        const remoteBranches = branchesNoDefault.filter(b => b.includes('remotes/origin'));
        const localBranches = branchesNoDefault.filter(b => !b.includes('remotes/origin'));
        const existingCaseIds = branches.map(b => branch.getBugIdFromBranchName(b));
        const choices = casesList.filter((c: any) => existingCaseIds.includes(c.ixBug.toString()));

        if(!choices.length){
            console.error('No cases branches were found to remove');
            process.exit(1);
        }

        const chosenCaseId = await select({
            message: 'Select a case that would you like to create a branch for?',
            choices: choices.map((c: {ixBug: string, sTitle: string}) => ({
                name: `${c.ixBug}: ${c.sTitle}`,
                value: c.ixBug
            }))
        });

        const branchName = branch.buildBranchName(config.username, chosenCaseId);

        log(await vcs.switchToBranch(config.branch));

        if(localBranches.find(b => b.includes(branchName))){
            log(await vcs.deleteLocalBranch(branchName));
            console.log(`"${branchName}" was removed from local`);
        }
        
        if(remoteBranches.find(b => b.includes(branchName))){
            log(await vcs.deleteRemoteBranch(branchName));
            console.log(`"${branchName}" was removed from remote`);
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
}


