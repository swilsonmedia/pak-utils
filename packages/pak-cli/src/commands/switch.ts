import { Argv } from 'yargs';
import { MiddlewareHandlerArguments } from '../types.js';
import chalk from 'chalk';


export const cmd = 'switch';

export const description = 'Switch between branches';

export function builder(yargs: Argv) {
    yargs
        .usage(`pak ${cmd}`);;
}

export async function handler({  _pak: { branch, prompts, bugz, logger, applicationError } }:  MiddlewareHandlerArguments){    
    try {
        const cases = await bugz.listCases({cols: ['sTitle']});
        const branches = await branch.listBranches();
        const casesMap = new Map(cases.map((bug: any )=> [bug.ixBug.toString(), bug.sTitle]));
        const choices = branches
            .filter(b => {
                return b.type !== 'case' || casesMap.has(b.id.toString())
            })
            .map(b => {
                let key = b.name;

                if(b.type === 'case'){
                    const id = b.id.toString();
                    
                    if(casesMap.has(id)){
                        key = `${b.id} - ${casesMap.get(id)}`
                    }
                }

                return {
                    name: key,
                    value: b.name
                }
            });

        const chosenBranch = await prompts.select({
            'message': 'What branch do you want to switch to?',
            'choices': choices
        });


        logger.log(await branch.switchTo(chosenBranch));

        logger.success(`Switch to ${chalk.bold(chosenBranch)}`)
    } catch (error) {
        applicationError(error);
    }
}


