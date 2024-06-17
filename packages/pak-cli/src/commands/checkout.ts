import { Argv } from 'yargs';
import { MiddlewareHandlerArguments } from '../types.js';

export const cmd = 'checkout';

export const description = 'Creates a new branch by case #';

export function builder(yargs: Argv) {
    yargs
        .usage(`pak ${cmd}`);
}

export async function handler({ _pak: { runTasks, branch, prompts, bugz, applicationError }  }: MiddlewareHandlerArguments){
    try {
        const existingCaseIds = await branch.getExistingBugIds();
        const casesList = await bugz.listCases({cols: ['sTitle']});

        if (!casesList.length) {
            applicationError('No cases were found in your queue to work on.');        
        }

        const casesListExcludingExisting = casesList.filter((c: any) => !existingCaseIds.includes(+c.ixBug))

        if (!casesListExcludingExisting.length) {
            applicationError('There are no new cases to checkout that you have not already.  Try using the "switch" command.');        
        }

        const enteredNumber = -1;

        let id = await prompts.select({
            message: 'Select a case that would you like to create a branch for?',
            choices: casesListExcludingExisting.map((c: any) => ({
                name: `${c.ixBug}: ${c.sTitle}`,
                value: c.ixBug
            })).concat([{
                name: 'Enter case number?',
                value: enteredNumber
            }])
        });

        if(+id === enteredNumber){
            id = await prompts.input({
                message: 'Enter case number'
            });
        }

        if(!id || !/^\d+$/gi.test(id)){
            applicationError('The case number entered was not a number.');
        }

        await runTasks([
            {
                title: `Checkout Branch for case #${id}`,
                task: async () => await branch.checkout(+id)
            },
            {
                title: 'Set Case Milestone to 3. Coding in Progress', 
                task: async () => await bugz.edit(id, {'plugin_customfields_at_fogcreek_com_casexmilestoneh849': '3.Coding in Progress'})
            }
        ]);        
    } catch (error) {
        applicationError(error);
    }
}

