import { Argv } from 'yargs';
import { MiddlewareHandlerArguments } from '../types.js';
import applicationError from '../utils/applicationerror.js';

export const cmd = 'cleanup';

export const description = 'Delete old branches from local and remote';

export function builder(yargs: Argv) {
    yargs
        .usage(`pak ${cmd}`);
}

export async function handler({ _pak: { branch, prompts, bugz, logger }  }: MiddlewareHandlerArguments){
    try {
        const existingCaseIds = await branch.getExistingBugIds();
        const casesList = await bugz.listCases({cols: ['sTitle']});
        
        if (!casesList.length) {
            applicationError('No cases were found');
        }

        const existingCasesList = casesList.filter((c: any) => existingCaseIds.includes(c.ixBug));
        
        if (!existingCasesList.length) {   
            applicationError('No cases were found');
        }
        
        const choices = casesList.filter((c: any) => existingCaseIds.includes(c.ixBug));
        
        if(!choices.length){
            applicationError('No cases branches were found to remove');
        }
        
        const id = await prompts.select({
            message: 'Select a case that would you like to create a branch for?',
            choices: choices.map((c: {ixBug: string, sTitle: string}) => ({
                name: `${c.ixBug}: ${c.sTitle}`,
                value: c.ixBug
            }))
        });
    
        logger.log(await branch.delete(+id));
        logger.success(`Branch deleted`);
    } catch (error) {
        applicationError(error);
    }
}
