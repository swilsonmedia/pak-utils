import { Argv } from 'yargs';
import { CheckoutMiddlewareHandlerArguments } from '../types.js';

export const cmd = 'checkout';

export const description = 'Creates a new branch by case #';

export function builder(yargs: Argv) {
    yargs
        .usage(`pak ${cmd}`)
        .options({
            'c': {
                alias: 'casenumber',
                type: 'number',
                description: 'The FogBugz case number'
            }
        });
}

export async function handler({ _pak: { runTasks, branch, prompts, bugz, applicationError }, ...args  }: CheckoutMiddlewareHandlerArguments){
    try {
        const existingCaseIds = await branch.getExistingBugIds();
        const casesList = await bugz.listCases({cols: ['sTitle']});

        if (!casesList.length) {
            applicationError('No cases were found in your queue to work on.');        
        }

        const casesListExcludingExisting = casesList.filter((c: any) => !existingCaseIds.includes(+c.ixBug));

        if (!casesListExcludingExisting.length) {
            applicationError('There are no new cases to checkout that you have not already.  Try using the "switch" command.');        
        }
      
        let id = -1;

        if('casenumber' in args){
            const casenumber = args.casenumber;

            if(!casenumber || isNaN(casenumber)){
                applicationError(`The casenumber you entered is not a number`);
                return;
            }

            id = casenumber;                
        }else{
            const enteredNumber = -1;
            const selection = await prompts.select({
                message: 'Select a case that would you like to create a branch for?',
                choices: casesListExcludingExisting.map((c: any) => ({
                    name: `${c.ixBug}: ${c.sTitle}`,
                    value: c.ixBug
                })).concat([{
                    name: 'Enter case number?',
                    value: enteredNumber
                }])
            });

            id = +selection;

            if(id === enteredNumber){
                const answer = await prompts.input({
                    message: 'Enter case number'
                });

                id = +answer;
            }           
        }

        if(!casesListExcludingExisting.map((c: any) => +c.ixBug).includes(id)){
            applicationError(`${id} does not match any of the cases in your queue.`);
        }

        if(isNaN(id)){
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

