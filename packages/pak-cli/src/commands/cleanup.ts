import { Argv } from 'yargs';
import { MiddlewareHandlerArguments } from '../types.js';

export const cmd = 'cleanup';

export const description = 'Delete old branches from local and remote';

export function builder(yargs: Argv) {
    yargs
        .usage(`pak ${cmd}`);
}

export async function handler({ _pak: { runTasks, branch, prompts, bugz, applicationError }  }: MiddlewareHandlerArguments){
    try {
        const caseBranches = await branch.getCaseBranches();
        const casesList = await bugz.listCases({cols: ['sTitle']});
        const caseListMap = new Map(casesList.map((item: any) => ([item.ixBug, item.sTitle])));
       
        const choices = caseBranches
            .map(({id, name}) => {                
                return {
                    name: `${name}${caseListMap.has(id) ? ` - ${caseListMap.get(id)}` : ''}`,
                    value: id.toString()
                }
            });
        
        if(!choices.length){
            applicationError('No cases branches were found to remove');
        }
        
        const id = await prompts.select({
            message: 'Select a case that would you like to cleanup?',
            choices
        });
    
       await runTasks([
            {
                title: `Delete branch for case #${id}`,
                task: async () => await branch.delete(+id)
            }
        ]);           
    } catch (error) {
        applicationError(error);
    }
}