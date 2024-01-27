import { Argv } from 'yargs';
import { MiddlewareHandlerArguments, VersionControl } from '../types.js';

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
        });
}

export async function handler({ verbose, _pak: { branch, prompts, bugz, versionControl }  }: MiddlewareHandlerArguments){
    
    const branches = await branch.getBranches();
    const casesList = await bugz.listCases({cols: ['sTitle']});
    const existingCaseIds = branch.getIdsFromBranches(branches);
    const choices = casesList.filter((c: any) => existingCaseIds.includes(c.ixBug));

    if (!casesList.length) {
        console.error('No cases were found');
        process.exit(1);
    }

    if(!choices.length){
        console.error('No cases branches were found to remove');
        process.exit(1);
    }

    const chosenCaseId = await prompts.select({
        message: 'Select a case that would you like to create a branch for?',
        choices: choices.map((c: {ixBug: string, sTitle: string}) => ({
            name: `${c.ixBug}: ${c.sTitle}`,
            value: c.ixBug
        }))
    });

    const branchName = branch.buildBranchName(+chosenCaseId);

    const cleanup = makeCleanup(versionControl);
    
    await cleanup({
        branches, 
        branchName, 
        verbose: !!verbose
    });
}

export function makeCleanup(versionControl: VersionControl){
    return async ({
        branches,
        branchName,
        verbose,
    } : {
        branches: string[],
        branchName: string,
        verbose: boolean
    }) => {
        
        const verboseLogger = logger(verbose);
        
        verboseLogger(await versionControl.switchToDefault());

        verboseLogger(await versionControl.deleteBranch(branchName));


        console.log(`${branchName} was deleted`);
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
