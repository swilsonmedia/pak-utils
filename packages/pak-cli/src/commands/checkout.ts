import { Argv, Arguments} from 'yargs';
import * as vcs from '../../../pak-vcs/dist/index.js';
import * as branch from '../utils/branch.js';
import createClient from 'pak-bugz';

interface Handler {
    userSettings: StoreConfigProps,
    select: prompts.SelectPrompt,
    vcs: typeof vcs,
    branch: typeof branch,
    createClient: typeof createClient
}

export const cmd = 'checkout';

export const description = 'Creates a new branch by case #';

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
        const branches = await branch.getBranches(userSettings.username, userSettings.branch, await vcs.listBranches(true)); 
        const existingCaseIds = branches
                                    .filter(b => branch.isBugBranchName(b))
                                    .map(b => branch.getBugIdFromBranchName(b));

        const client = createClient({
            token: userSettings.token,
            origin: userSettings.origin
        });

        const casesList = await client.listCases({cols: ['sTitle']});
        const casesListExcludingExisting = casesList.filter((c: any) => !existingCaseIds.includes(c.ixBug))

        if (!casesListExcludingExisting.length) {
            console.error('No cases were found');
            process.exit(1);
        }

        const chosenCaseId = await select({
            message: 'Select a case that would you like to create a branch for?',
            choices: casesListExcludingExisting.map((c: any) => ({
                name: `${c.ixBug}: ${c.sTitle}`,
                value: c.ixBug
            }))
        });

        const branchName = branch.buildBranchName(userSettings.username, chosenCaseId);
        
        log(await vcs.switchToBranch(userSettings.branch));        
        log(await vcs.pull());
        log(await vcs.checkout(branchName));
        log(await vcs.setUpstream(branchName));
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


