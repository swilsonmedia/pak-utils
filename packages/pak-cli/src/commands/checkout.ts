import { Argv } from 'yargs';
import {BranchUtils, BugzClient, MiddlewareHandlerArguments, SelectPrompt, VCS} from '../types.js';

interface Handler {
    select: SelectPrompt,
    vcs: VCS,
    branch: BranchUtils,
    bugzClient: BugzClient
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
        select,
        vcs,
        branch,
        bugzClient
    }: Handler
){
    return async ({ verbose, userSettings }: MiddlewareHandlerArguments) => {
        const log = logger(!!verbose);        
        const branches = await branch.getBranches(userSettings.username, userSettings.branch, await vcs.listBranches(true)); 
        const existingCaseIds = branches
                                    .filter(b => branch.isBugBranchName(b))
                                    .map(b => branch.getBugIdFromBranchName(b));

        const client = bugzClient({
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


