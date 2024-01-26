import { Argv } from 'yargs';
import { MiddlewareHandlerArguments } from '../types.js';

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
        });
}

export async function handler({ verbose, _pak: { branch, versionControl, prompts, bugz }  }: MiddlewareHandlerArguments){

    const log = logger(!!verbose);        
    const branches = await branch.getBranches(); 
    const existingCaseIds = branch.getIdsFromBranches(branches);
    const casesList = await bugz.listCases({cols: ['sTitle']});
    const casesListExcludingExisting = casesList.filter((c: any) => !existingCaseIds.includes(c.ixBug))

    if (!casesListExcludingExisting.length) {
        console.error('No cases were found');
        process.exit(1);
    }

    const chosenCaseId = await prompts.select({
        message: 'Select a case that would you like to create a branch for?',
        choices: casesListExcludingExisting.map((c: any) => ({
            name: `${c.ixBug}: ${c.sTitle}`,
            value: c.ixBug
        }))
    });

    const branchName = branch.buildBranchName(+chosenCaseId);
    
    log(await versionControl.switchToDefault());        
    log(await versionControl.pull());
    log(await versionControl.checkout(branchName));
}

function logger(verbose: boolean){
    return (input: string): void => {
        if(!verbose){
            return;
        }

        console.log(input);
    }
}
