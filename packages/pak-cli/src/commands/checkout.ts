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

export async function handler({ verbose, _pak: { branch, prompts, bugz }  }: MiddlewareHandlerArguments){

    const log = logger(!!verbose);   

    const existingCaseIds = await branch.getExistingBugIds();
    const casesList = await bugz.listCases({cols: ['sTitle']});

    if (!casesList.length) {
        console.error('No cases were found');
        process.exit(1);
    }

    const casesListExcludingExisting = casesList.filter((c: any) => !existingCaseIds.includes(+c.ixBug))

    if (!casesListExcludingExisting.length) {
        console.error('No cases were found');
        process.exit(1);
    }

    const id = await prompts.select({
        message: 'Select a case that would you like to create a branch for?',
        choices: casesListExcludingExisting.map((c: any) => ({
            name: `${c.ixBug}: ${c.sTitle}`,
            value: c.ixBug
        }))
    });

    log(await branch.checkout(+id));
}

function logger(verbose: boolean){
    return (input: string): void => {
        if(!verbose){
            return;
        }

        console.log(input);
    }
}
