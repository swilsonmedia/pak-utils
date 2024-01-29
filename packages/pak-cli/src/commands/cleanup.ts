import { Argv } from 'yargs';
import { BranchUtilities, MiddlewareHandlerArguments } from '../types.js';

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

export async function handler({ verbose, _pak: { branch, prompts, bugz }  }: MiddlewareHandlerArguments){
    const verboseLogger = logger(verbose ?? false);
    const existingCaseIds = await branch.getExistingBugIds();
    const casesList = await bugz.listCases({cols: ['sTitle']});
    
    if (!casesList.length) {
        console.error('No cases were found');
        process.exit(1);
    }

    const existingCasesList = casesList.filter((c: any) => existingCaseIds.includes(c.ixBug));
    
    if (!existingCasesList.length) {   
        console.error('No cases were found');
        process.exit(1);
    }
    
    const choices = casesList.filter((c: any) => existingCaseIds.includes(c.ixBug));
    
    if(!choices.length){
        console.error('No cases branches were found to remove');
        process.exit(1);
    }

    
    const id = await prompts.select({
        message: 'Select a case that would you like to create a branch for?',
        choices: choices.map((c: {ixBug: string, sTitle: string}) => ({
            name: `${c.ixBug}: ${c.sTitle}`,
            value: c.ixBug
        }))
    });
   
    verboseLogger(await branch.delete(+id));
    console.log(`Branch deleted`);
}

function logger(verbose: boolean){
    return (input: string): void => {
        if(!verbose){
            return;
        }

        console.log(input);
    }
}
